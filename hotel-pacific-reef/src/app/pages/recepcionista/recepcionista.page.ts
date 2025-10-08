import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
  IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonText, IonCardSubtitle
} from '@ionic/angular/standalone';

import { NavController, ToastController } from '@ionic/angular';
import { AuthDbService, Reserva, Habitacion } from '../../services/auth-db.service';

type Alerta = { titulo: string; mensaje: string; critico: boolean };

@Component({
  selector: 'app-recepcionista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
    IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonText, IonCardSubtitle
  ],
  templateUrl: './recepcionista.page.html',
  styleUrls: ['./recepcionista.page.scss']
})
export class RecepcionistaPage implements OnInit, OnDestroy {
  reservasHoy: Reserva[] = [];
  habitacionesOcupadas = 0;
  totalHabitaciones = 0;
  ingresosHoy = 0;
  alertas: Alerta[] = [];
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

  ngOnDestroy() {
    // No-op: aquí puedes limpiar subscripciones si las agregas en el futuro
  }

  /* ================== Dashboard ================== */

  private todayISO(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  cargarDashboard() {
    const hoy = this.todayISO();

    const todasReservas: Reserva[] = this.authDb.listReservations();
    const habitaciones: Habitacion[] = this.authDb.listRooms();

    // Reservas de hoy (no usadas por QR aún)
    this.reservasHoy = todasReservas.filter(r =>
      (r.llegada || '').slice(0, 10) === hoy && !(r as any).qrUsado
    );

    // Próximos check-ins (hoy) priorizando las que no están pendientes de pago
    this.proximosCheckins = [...this.reservasHoy]
      .filter(r => (r as any).estadoPago !== 'pendiente')
      .sort((a, b) => (a.llegada || '').localeCompare(b.llegada || ''));

    // Ocupación
    this.totalHabitaciones = habitaciones.length;
    this.habitacionesOcupadas = habitaciones.filter(h => !h.disponible).length;

    // Ingresos del día (aproximado por % pagado de reservas de hoy)
    this.ingresosHoy = this.reservasHoy.reduce((acc, r) => {
      const total = this.totalOf(r);
      const pct = (r as any).porcentajePagado ?? ((r as any).estadoPago === 'pagado' ? 100 : 0);
      return acc + Math.round(total * (pct / 100));
    }, 0);

    // Alertas
    this.generarAlertas(todasReservas, habitaciones, hoy);
  }

  private generarAlertas(reservas: Reserva[], habitaciones: Habitacion[], hoyISO: string) {
    this.alertas = [];

    // Pagos pendientes para hoy
    reservas
      .filter(r => (r as any).estadoPago === 'pendiente' && (r.llegada || '').slice(0, 10) === hoyISO)
      .forEach(r => {
        this.alertas.push({
          titulo: 'Pago pendiente',
          mensaje: `Reserva #${r.id} de ${r.datosHuesped?.nombreCompleto || r.email} no está pagada.`,
          critico: true
        });
      });

    // Posible overbooking por habitación para hoy
    habitaciones.forEach(h => {
      const reservasHoyDeHab = reservas.filter(r =>
        r.habitacionId === h.id &&
        !(r as any).qrUsado &&
        (r.llegada || '').slice(0, 10) === hoyISO
      );
      if (reservasHoyDeHab.length > 1) {
        this.alertas.push({
          titulo: 'Posible overbooking',
          mensaje: `Habitación ${h.nombre} tiene múltiples reservas para hoy.`,
          critico: true
        });
      }
    });
  }

  /* ================== Acciones ================== */

  async procesarCheckin(reserva: Reserva) {
    this.nav.navigateForward('/recepcionista/checkin', {
      state: { reservaId: reserva.id }
    });
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }

  /* ================== Helpers ================== */

  currency(v: number) {
    return v.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    });
  }

  private effectiveNights(r: Reserva): number {
    if (typeof r.noches === 'number' && r.noches > 0) return r.noches;
    const s = new Date((r.llegada || '').slice(0, 10) + 'T00:00:00');
    const e = new Date((r.salida || '').slice(0, 10) + 'T00:00:00');
    const MS = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.round((e.getTime() - s.getTime()) / MS));
    }

  private totalOf(r: Reserva): number {
    if (typeof r.total === 'number' && r.total > 0) return r.total;
    const noches = this.effectiveNights(r);
    const pn = (r as any).precioNoche || 0;
    return noches * pn;
  }

  trackById = (_: number, r: Reserva) => r.id;
}
