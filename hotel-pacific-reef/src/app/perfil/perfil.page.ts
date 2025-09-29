import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController, ToastController } from '@ionic/angular';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthDbService, Reserva } from '../services/auth-db.service';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    TranslatePipe
  ],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss']
})
export class PerfilPage implements OnInit {
  email: string | null = null;
  reservas: Reserva[] = [];
  selectedLanguage = 'es';

  // Modal edición
  editOpen = false;
  editReserva: Reserva | null = null;
  editLlegada = '';              
  editSalida  = '';               
  editError   = '';
  minDate = '';
  maxDate = '';
  minEdit = '';
  maxEdit = '';
  showPickers = false;

  constructor(
    private authDb: AuthDbService,
    private nav: NavController,
    private alert: AlertController,
    private toast: ToastController,
    private translationService: TranslationService
  ) {}

  async ngOnInit() {
    await this.authDb.init();
    this.email = this.authDb.getSessionEmail();
    if (!this.email) {
      this.nav.navigateRoot('/login');
      return;
    }


    this.selectedLanguage = this.translationService.getCurrentLang();

    // rango de dias mínimo/máximo

    const hoy = new Date();
    this.minDate = this.toISO(this.addDays(hoy, 5));
    this.maxDate = this.toISO(this.addDays(hoy, 365));

    this.load();
  }

  // idioma
  changeLanguage() {
    this.translationService.setLanguage(this.selectedLanguage);
    window.location.reload();
  }

  load() {
    if (!this.email) return;
    this.reservas = this.authDb.listReservationsByEmail(this.email);
  }

  currency(v: number) {
    return v.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }

  async borrarReserva(r: Reserva) {
    const a = await this.alert.create({
      header: 'Eliminar reserva',
      message: `¿Eliminar la reserva #${r.id} de "${r.nombreHabitacion}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            this.authDb.removeReservation(r.id);
            this.load();
            (await this.toast.create({ message: 'Reserva eliminada', duration: 1500, color: 'success' })).present();
          }
        }
      ]
    });
    await a.present();
  }

  abrirEditar(r: Reserva) {
    this.editReserva = r;

    const llegadaNorm = this.normalizeISO(r.llegada);
    const salidaNorm  = this.normalizeISO(r.salida);

    this.editLlegada = llegadaNorm;
    this.editSalida  = salidaNorm;

    this.minEdit = this.minISO(this.minDate, llegadaNorm);
    this.maxEdit = this.maxISO(this.maxDate,  salidaNorm);

    this.editError = '';
    this.editOpen = true;

    this.showPickers = false;
    setTimeout(() => { this.showPickers = true; }, 0);
  }

  cerrarEditar() {
    this.editOpen = false;
    this.editReserva = null;
    this.editLlegada = this.editSalida = '';
    this.editError = '';
    this.showPickers = false;
  }

  onChangeLlegada(ev: CustomEvent) {
    const v = (ev.detail as any).value as string | null;
    this.editLlegada = v ? v.slice(0, 10) : '';
    this.editError = '';
    if (this.editLlegada && this.editSalida && this.editLlegada >= this.editSalida) {
      this.editError = 'La salida debe ser posterior a la llegada.';
    }
  }

  onChangeSalida(ev: CustomEvent) {
    const v = (ev.detail as any).value as string | null;
    this.editSalida = v ? v.slice(0, 10) : '';
    this.editError = '';
    if (this.editLlegada && this.editSalida && this.editLlegada >= this.editSalida) {
      this.editError = 'La salida debe ser posterior a la llegada.';
    }
  }

  puedeGuardarEdicion(): boolean {
    if (!this.editReserva) return false;
    if (!this.editLlegada || !this.editSalida) return false;
    if (this.editLlegada >= this.editSalida) return false;
    if (this.editLlegada < this.minEdit) return false;
    if (this.editSalida  > this.maxEdit) return false;
    return true;
  }

  async guardarEdicion() {
    if (!this.editReserva) return;
    try {
      this.authDb.updateReservationDates(this.editReserva.id, this.editLlegada, this.editSalida);
      (await this.toast.create({ message: 'Reserva actualizada', duration: 1800, color: 'success' })).present();
      this.cerrarEditar();
      this.load();
    } catch (e: any) {
      this.editError = e?.message || 'No se pudo actualizar';
    }
  }

  trackById(index: number, item: Reserva) { return item.id; }

  // ===== fechas =====
  private normalizeISO(v: string): string { return (v || '').slice(0, 10); }
  private minISO(a: string, b: string) { return a <= b ? a : b; }
  private maxISO(a: string, b: string) { return a >= b ? a : b; }

  private toISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  private addDays(base: Date, days: number) {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  }
}
