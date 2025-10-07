import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { AuthDbService, Reserva, Habitacion } from '../../services/auth-db.service';

@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './recepcionista.page.html'
})
export class RecepcionistaPage implements OnInit {
  reservasHoy: Reserva[] = [];
  habitacionesOcupadas = 0;
  totalHabitaciones = 0;
  ingresosHoy = 0;
  alertas: any[] = [];
  proximosCheckins: Reserva[] = [];

  constructor(
    private authDb: AuthDbService,
    private nav: NavController,
    private toast: ToastController
  ) {}
  

  async ngOnInit() {
    await this.authDb.init();
    this.cargarDashboard();
  }

  cargarDashboard() {
    const hoy = new Date().toISOString().split('T')[0];
    const todasReservas = this.authDb.listReservations();
    
    this.reservasHoy = todasReservas.filter(r => 
      r.llegada.split('T')[0] === hoy && !r.qrUsado
    );

    this.proximosCheckins = this.reservasHoy
      .filter(r => r.estadoPago !== 'pendiente')
      .sort((a, b) => a.llegada.localeCompare(b.llegada));

    const habitaciones = this.authDb.listRooms();
    this.totalHabitaciones = habitaciones.length;
    this.habitacionesOcupadas = habitaciones.filter(h => !h.disponible).length;

    this.generarAlertas();
  }

  generarAlertas() {
    this.alertas = [];
    const reservas = this.authDb.listReservations();
    const hoy = new Date().toISOString().split('T')[0];

    reservas
      .filter(r => r.estadoPago === 'pendiente' && r.llegada.split('T')[0] === hoy)
      .forEach(r => {
        this.alertas.push({
          titulo: 'Pago Pendiente',
          mensaje: `Reserva #${r.id} de ${r.datosHuesped?.nombreCompleto} no está pagada`,
          critico: true
        });
      });


    const habitaciones = this.authDb.listRooms();
    habitaciones.forEach(h => {
      const reservasHabitacion = reservas.filter(r => 
        r.habitacionId === h.id && 
        !r.qrUsado && 
        r.llegada.split('T')[0] === hoy
      );
      if (reservasHabitacion.length > 1) {
        this.alertas.push({
          titulo: 'Posible Overbooking',
          mensaje: `Habitación ${h.nombre} tiene múltiples reservas para hoy`,
          critico: true
        });
      }
    });
  }

  async procesarCheckin(reserva: Reserva) {
    this.nav.navigateForward('/recepcionista/checkin', {
      state: { reservaId: reserva.id }
    });
  }

  currency(v: number) {
    return v.toLocaleString('es-CL', { 
      style: 'currency', 
      currency: 'CLP', 
      maximumFractionDigits: 0 
    });
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }
}


