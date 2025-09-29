
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthDbService, Reserva } from '../../services/auth-db.service';

@Component({
  selector: 'app-admin-reservas',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './admin-reservas.page.html',
  styleUrls: ['./admin-reservas.page.scss']
})
export class AdminReservasPage implements OnInit {
  reservas: Reserva[] = [];
  view: Reserva[] = [];
  q = '';                
  mes = '';              
  mesesDisponibles: string[] = [];

  constructor(
    private db: AuthDbService,
    private alert: AlertController,
    private auth: AuthDbService,
    private nav: NavController,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    await this.db.init();
    this.load();
  }

  load() {
    this.reservas = this.db.listReservations();
    const set = new Set<string>();
    for (const r of this.reservas) {
      const m = (r.llegada || r.createdAt).slice(0, 7); // YYYY-MM
      set.add(m);
    }
    this.mesesDisponibles = [...set].sort((a, b) => a.localeCompare(b));
    this.applyFilters();
  }

  applyFilters() {
    const q = (this.q || '').toLowerCase().trim();
    const mes = (this.mes || '').trim();
    this.view = this.reservas.filter(r => {
      const okQ = !q || r.email.toLowerCase().includes(q) || r.nombreHabitacion.toLowerCase().includes(q);
      const okMes = !mes || ((r.llegada || r.createdAt).slice(0, 7) === mes);
      return okQ && okMes;
    });
  }


  async confirmDelete(r: Reserva) {
    const a = await this.alert.create({
      header: 'Eliminar reserva',
      message: `¿Eliminar la reserva #${r.id} de "${r.nombreHabitacion}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.db.removeReservation(r.id);
            this.ok('Reserva eliminada');
            this.load();
          }
        }
      ]
    });
    await a.present();
  }

  del(r: Reserva) {
    this.db.removeReservation(r.id);
    this.ok('Reserva eliminada');
    this.load();
  }


  totalView(): number {
    return this.view.reduce((acc, r) => acc + this.totalOf(r), 0);
  }

  totalOf(r: Reserva): number {
    const noches = this.effectiveNights(r);
    const base = noches * (r.precioNoche || 0);
    return (typeof r.total === 'number' && r.total > 0) ? r.total : base;
  }

  effectiveNights(r: Reserva): number {
    if (typeof r.noches === 'number' && r.noches > 0) return r.noches;
    return this.diffNights(r.llegada, r.salida);
  }

  private diffNights(isoStart?: string, isoEnd?: string): number {
    if (!isoStart || !isoEnd) return 0;
    const s = new Date(isoStart.slice(0, 10) + 'T00:00:00');
    const e = new Date(isoEnd.slice(0, 10) + 'T00:00:00');
    const MS = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.round((e.getTime() - s.getTime()) / MS));
  }

 
  currency(v: number) {
    return (v ?? 0).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    });
  }

  private async ok(message: string, color: 'success' | 'danger' | 'medium' = 'success') {
    (await this.toast.create({ message, duration: 1600, color, position: 'bottom' })).present();
  }


  


  // ⬅️ nuevo método
  logout(ev?: Event) {
    ev?.preventDefault();
    this.auth.logout();
    this.nav.navigateRoot('/login');
  }
}

