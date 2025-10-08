import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonIcon,
  IonButton, IonSearchbar
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { AuthDbService, Habitacion, Reserva } from '../../services/auth-db.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-recepcionista-reservas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink, RouterLinkActive,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonBadge, IonIcon,
    IonButton, IonSearchbar,
    NgIf, NgFor, TitleCasePipe
  ],
  templateUrl: './recepcionista-reservas.page.html',
  styleUrls: ['./recepcionista-reservas.page.scss']
})
export class RecepcionistaReservasPage implements OnInit {
  ocupadas: Habitacion[] = [];
  proximasPorHab: Array<{ habitacion: Habitacion; reservas: Reserva[] }> = [];

  pendientes: Reserva[] = [];
  all: Reserva[] = [];
  filtradas: Reserva[] = [];
  q = '';

  constructor(
    private db: AuthDbService,
    private nav: NavController
  ) {}

  async ngOnInit() {
    await this.db.init();
    this.all = this.db.listReservations();
    this.filtradas = this.all;
  }

  filtrar() {
    const t = (this.q || '').toLowerCase();
    if (!t) {
      this.filtradas = this.all;
      return;
    }

    this.filtradas = this.all.filter(r =>
      String(r.id).includes(t) ||
      (r.datosHuesped?.nombreCompleto || '').toLowerCase().includes(t) ||
      (r.datosHuesped?.email || r.email).toLowerCase().includes(t) ||
      (r.nombreHabitacion || '').toLowerCase().includes(t)
    );
  }

  irCheckin(r: Reserva) {
    this.nav.navigateForward('/recepcionista/checkin', {
      state: { reservaId: r.id }
    });
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.db.logout();
    this.nav.navigateRoot('/login');
  }

  currency(v: number) {
    return (v ?? 0).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    });
  }
}
