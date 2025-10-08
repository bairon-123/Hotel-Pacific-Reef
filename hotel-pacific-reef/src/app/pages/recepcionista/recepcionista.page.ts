import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButton, IonButtons, IonList, IonItem, IonLabel,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge
} from '@ionic/angular/standalone';
import { AuthDbService, Reserva } from '../../services/auth-db.service';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButton, IonButtons, IonList, IonItem, IonLabel,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge
  ],
  templateUrl: './recepcionista.page.html',
  styleUrls: ['./recepcionista.page.scss']
})
export class RecepcionistaPage implements OnInit {
  reservasHoy: Reserva[] = [];
  proximos7dias: Reserva[] = [];
  reservasMes = 0;

  habitacionesOcupadas = 0;
  totalHabitaciones = 0;
  ingresosHoy = 0;

  alertas: { titulo: string; mensaje: string; critico?: boolean }[] = [];

  constructor(
    private authDb: AuthDbService,
    private nav: NavController,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    await this.authDb.init();
    this.cargarDashboard();
  }

  private cargarDashboard() {
    const hoy = new Date().toISOString().slice(0,10);
    const todas = this.authDb.listReservations();

    this.reservasHoy = todas
      .filter(r => r.llegada.slice(0,10) === hoy && !r.qrUsado)
      .sort((a,b)=>a.llegada.localeCompare(b.llegada));

    this.proximos7dias = this.authDb.listProximosCheckins(7);
    this.reservasMes   = this.authDb.countReservasMesActual();

    const rooms = this.authDb.listRooms();
    this.totalHabitaciones   = rooms.length;
    this.habitacionesOcupadas = rooms.filter(h => h.estado === 'ocupada').length;

    this.ingresosHoy = todas
      .filter(r => r.llegada.slice(0,10) === hoy)
      .reduce((acc, r) => acc + (r.total || 0), 0);

    this.generarAlertas(hoy, todas);
  }

  private generarAlertas(hoy: string, reservas: Reserva[]) {
    this.alertas = [];

    reservas.filter(r => r.llegada.slice(0,10) === hoy && r.estadoPago !== 'pagado')
      .forEach(r => this.alertas.push({
        titulo: 'Pago pendiente',
        mensaje: `Reserva #${r.id} (${r.nombreHabitacion}) — ${r.datosHuesped?.nombreCompleto || r.email}`
      }));

    const porHab = new Map<number, number>();
    reservas.filter(r => r.llegada.slice(0,10) === hoy && !r.qrUsado)
      .forEach(r => porHab.set(r.habitacionId, (porHab.get(r.habitacionId) || 0) + 1));
    [...porHab.entries()]
      .filter(([,n]) => n > 1)
      .forEach(([habitacionId, n]) => this.alertas.push({
        titulo: 'Posible overbooking',
        mensaje: `Habitación #${habitacionId} tiene ${n} reservas para hoy`,
        critico: true
      }));
  }

  procesarCheckin(r: Reserva) {
    this.nav.navigateForward('/recepcionista/checkin', { state: { reservaId: r.id } });
  }

  currency(v: number) {
    return (v ?? 0).toLocaleString('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }
}
