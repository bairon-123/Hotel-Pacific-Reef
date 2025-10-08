import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonIcon, IonButton
} from '@ionic/angular/standalone';
import { AuthDbService, Habitacion, Reserva } from '../../services/auth-db.service';
import { AlertController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-recepcionista-pagos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, RouterLinkActive,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonBadge, IonIcon, IonButton
  ],
  templateUrl: './recepcionista-pagos.page.html',
  styleUrls: ['./recepcionista-pagos.page.scss']
})
export class RecepcionistaPagosPage implements OnInit {
  ocupadas: Habitacion[] = [];
  proximasPorHab: Array<{ habitacion: Habitacion; reservas: Reserva[] }> = [];

  // ✅ arranca vacío para evitar errores de template antes de ngOnInit
  pendientes: Reserva[] = [];

  constructor(
    private db: AuthDbService,
    private nav: NavController,
    private alert: AlertController,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    await this.db.init();
    this.refresh();
  }

  private refresh() {
    this.pendientes = this.db.reportPagosPendientes(); // hoy con estado != pagado
  }

  restante(r: Reserva) {
    const pagado = (r.total || 0) * (r.porcentajePagado || 0) / 100;
    return Math.max(0, (r.total || 0) - pagado);
  }

  currency(v: number) {
    return (v ?? 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

  async pagar(r: Reserva) {
    const rest = this.restante(r);
    const a = await this.alert.create({
      header: 'Registrar pago',
      inputs: [
        { name: 'monto', type: 'number', placeholder: 'Monto', value: rest, min: 0 },
        { name: 'metodo', type: 'radio', label: 'Efectivo', value: 'efectivo', checked: true },
        { name: 'metodo', type: 'radio', label: 'Tarjeta', value: 'tarjeta' },
        { name: 'metodo', type: 'radio', label: 'Transferencia', value: 'transferencia' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: (d: any) => {
            const monto = Number(d?.monto);
            const metodo = d?.metodo || 'efectivo';
            if (!monto || monto <= 0) {
              this.msg('Ingresa un monto válido.');
              return false;
            }
            try {
              const recep = this.db.getSessionEmail() || '';
              this.db.registrarPago(r.id, monto, metodo, recep);
              this.ok('Pago registrado.');
              this.refresh();
            } catch (e: any) {
              this.msg(e?.message || 'No se pudo registrar el pago.');
              return false;
            }
            return true;
          }
        }
      ]
    });
    await a.present();
  }

  completarPago(r: Reserva) {
    const restante = this.restante(r);
    if (restante <= 0) return;
    try {
      const recep = this.db.getSessionEmail() || '';
      this.db.registrarPago(r.id, restante, 'ajuste-restante', recep);
      this.ok('Pago completado.');
      this.refresh();
    } catch (e: any) {
      this.msg(e?.message || 'No se pudo completar el pago.');
    }
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.db.logout();
    this.nav.navigateRoot('/login');
  }

  private async ok(text: string) {
    (await this.toast.create({ message: text, duration: 1600, color: 'success' })).present();
  }

  private async msg(text: string) {
    (await this.toast.create({ message: text, duration: 2000, color: 'danger' })).present();
  }
}
