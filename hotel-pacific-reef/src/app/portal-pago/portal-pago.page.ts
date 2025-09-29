import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule, ToastController, LoadingController, AlertController, NavController
} from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthDbService, Habitacion } from '../services/auth-db.service';
import QRCode from 'qrcode';

@Component({
  selector: 'app-portal-pago',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './portal-pago.page.html',
  styleUrls: ['./portal-pago.page.scss']
})
export class PortalPagoPage implements OnInit {

  currentEmail: string | null = null;

  habitacion: Habitacion | null = null;
  llegada: string | null = null;
  salida:  string | null = null;
  noches = 0;
  totalEstadia = 0;

  opcionPago: 'completo' | 'parcial' | '' = '';
  metodoPago: 'transferencia' | 'tarjeta' | '' = '';
  montoAPagar = 0;

  comprobanteTransferencia = '';
  tarjetaNumero = '';
  tarjetaNombre = '';
  tarjetaExpiracion = '';
  tarjetaCVV = '';

  contactForm = this.fb.group({
    nombre:   ['', [Validators.required, Validators.minLength(2)]],
    email:    ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,}$/)]],
  });

  constructor(
    private db: AuthDbService,
    private fb: FormBuilder,
    private toast: ToastController,
    private loading: LoadingController,
    private alert: AlertController,
    private nav: NavController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.db.init();
    this.currentEmail = this.db.getSessionEmail();
    if (!this.currentEmail) { this.nav.navigateRoot('/login'); return; }

    const state = this.router.getCurrentNavigation()?.extras?.state as any || history.state;
    const roomId: number | undefined = state?.roomId;
    this.llegada = state?.llegada || null;
    this.salida  = state?.salida  || null;
    this.noches  = Number(state?.noches || 0);

    const rooms = this.db.listRooms?.() || [];
    this.habitacion = rooms.find((r: Habitacion) => r.id === roomId) || null;

    if (!this.habitacion || !this.llegada || !this.salida || this.noches <= 0) {
      await this.msg('Datos de la reserva incompletos. Vuelve a Reservas.');
      this.nav.navigateBack('/reservas');
      return;
    }

    this.totalEstadia = this.habitacion.precioNoche * this.noches;
    this.opcionPago = 'completo';
    this.calcularPago();
    this.metodoPago = 'transferencia';
    this.contactForm.patchValue({ email: this.currentEmail });
  }

  /* ================= UI helpers ================= */
  currency(v?: number | null) {
    const n = Number(v ?? 0);
    return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }
  async msg(text: string, color: 'danger' | 'success' | 'medium' = 'danger') {
    (await this.toast.create({ message: text, duration: 2000, color, position: 'bottom' })).present();
  }
  logout(ev?: Event) { ev?.preventDefault(); this.db.logout(); this.nav.navigateRoot('/login'); }

  /* ================= Pago ================= */
  calcularPago() {
    if (!this.habitacion) { this.montoAPagar = 0; return; }
    this.montoAPagar = (this.opcionPago === 'parcial') ? Math.round(this.totalEstadia * 0.3) : this.totalEstadia;
    if (this.opcionPago && !this.metodoPago) this.metodoPago = 'transferencia';
  }
  formularioValido(): boolean {
    if (!this.contactForm.valid) return false;
    if (!this.habitacion || !this.llegada || !this.salida || this.noches <= 0) return false;
    if (!this.opcionPago || !this.metodoPago) return false;
    if (this.metodoPago === 'transferencia') {
      if (!this.comprobanteTransferencia.trim()) return false;
    } else if (this.metodoPago === 'tarjeta') {
      if (!/^\d{13,19}$/.test(this.tarjetaNumero.replace(/\s/g, ''))) return false;
      if (this.tarjetaNombre.trim().length < 2) return false;
      if (!/^\d{2}\/\d{2}$/.test(this.tarjetaExpiracion)) return false;
      if (!/^\d{3,4}$/.test(this.tarjetaCVV)) return false;
    }
    return true;
  }

  async confirmarPago() {
    if (!this.formularioValido()) return this.msg('Revisa los campos obligatorios.');
    const loading = await this.loading.create({ message: 'Procesando pago…' });
    await loading.present();

    try {
      const hab = this.habitacion!;
      const ok = this.db.isRangeAvailable(hab.id, this.llegada!, this.salida!);
      if (!ok) throw new Error('La habitación ya no está disponible en esas fechas.');

      const reserva = this.db.addReservation({
        email: this.currentEmail!,
        habitacionId: hab.id,
        nombreHabitacion: hab.nombre,
        tipo: hab.tipo,
        llegada: this.llegada!,
        salida: this.salida!,
        noches: this.noches,
        precioNoche: hab.precioNoche,
        total: this.totalEstadia
      });

      // Texto “humano” para el QR (también lo guardamos como payload)
      const payload =
        `HOTEL PACIFIC REEF\n` +
        `Reserva #${reserva.id}\n` +
        `Huésped: ${reserva.email}\n` +
        `Habitación: ${reserva.nombreHabitacion} (${this.titlecase(reserva.tipo)})\n` +
        `Llegada: ${this.fmtDate(reserva.llegada)} 14:00\n` +
        `Salida : ${this.fmtDate(reserva.salida)} 12:00\n` +
        `Noches : ${reserva.noches}\n` +
        `Total  : ${this.currency(reserva.total)}\n` +
        `Generado: ${this.nowLocal()}`;

      // QR “puro” (dataURL)
      const qrOnlyUrl = await QRCode.toDataURL(payload, { width: 360, margin: 1 });

      // *** NUEVO: poster con QR + datos ***
      const posterUrl = await this.renderQrPoster(qrOnlyUrl, reserva);

      // Guardamos el poster en la reserva (se verá en Perfil)
      this.db.attachQrToReservation(reserva.id, posterUrl, payload);

      await loading.dismiss();
      const done = await this.alert.create({
        header: 'Pago confirmado',
        message: 'Tu reserva fue generada con éxito. El QR con los datos está en tu perfil.',
        buttons: [{ text: 'Ir a Perfil', handler: () => this.nav.navigateRoot('/perfil') }]
      });
      done.present();

    } catch (e: any) {
      await loading.dismiss();
      const er = await this.alert.create({ header: 'Error', message: e?.message || 'No se pudo completar el pago.', buttons: ['OK'] });
      er.present();
    }
  }

  /* ============ Helpers para el poster ============ */
  private titlecase(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  private fmtDate(iso: string) {
    const [y,m,d] = iso.split('-').map(Number);
    return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
  }
  private nowLocal() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2,'0');
    const mi = String(d.getMinutes()).padStart(2,'0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src; });
  }
  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y,   x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x,   y+h, r);
    ctx.arcTo(x,   y+h, x,   y,   r);
    ctx.arcTo(x,   y,   x+w, y,   r);
    ctx.closePath();
  }

  /** Dibuja una imagen tipo tarjeta: banner + datos + QR */
  private async renderQrPoster(qrDataUrl: string, reserva: any): Promise<string> {
    const W = 1000, H = 600;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // fondo degradado
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#e0f2fe'); // azul claro
    g.addColorStop(1, '#f1f5f9'); // gris muy claro
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // tarjeta blanca
    const pad = 32;
    const cardX = pad, cardY = pad, cardW = W - pad*2, cardH = H - pad*2;
    ctx.shadowColor = 'rgba(0,0,0,.15)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 22);
    ctx.fillStyle = '#ffffff'; ctx.fill();

    ctx.shadowColor = 'transparent';

    // “logo” simple (círculo con H)
    const logoX = cardX + 26, logoY = cardY + 26, logoR = 22;
    ctx.beginPath(); ctx.arc(logoX+logoR, logoY+logoR, logoR, 0, Math.PI*2);
    ctx.fillStyle = '#0ea5e9'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px system-ui,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('H', logoX+logoR, logoY+logoR);

    // título
    ctx.fillStyle = '#0f172a'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '700 26px system-ui,sans-serif';
    ctx.fillText('Hotel Pacific Reef — Confirmación de Reserva', logoX + logoR*2 + 16, logoY + logoR + 6);

    // datos (columna izquierda)
    const leftX = cardX + 34;
    let y = cardY + 110;
    const lh = 30;
    const line = (label: string, value: string) => {
      ctx.font = '600 18px system-ui,sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(label, leftX, y);
      ctx.font = '400 18px system-ui,sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(value, leftX + 180, y);
      y += lh;
    };

    line('Reserva', `#${reserva.id}`);
    line('Huésped', reserva.email);
    line('Habitación', `${reserva.nombreHabitacion} (${this.titlecase(reserva.tipo)})`);
    line('Llegada', `${this.fmtDate(reserva.llegada)} 14:00`);
    line('Salida',  `${this.fmtDate(reserva.salida)} 12:00`);
    line('Noches',  String(reserva.noches));
    line('Total',    this.currency(reserva.total));

    // QR (columna derecha)
    const qrImg = await this.loadImage(qrDataUrl);
    const qrSize = 320;
    const qrX = cardX + cardW - qrSize - 40;
    const qrY = cardY + 120;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // pie
    ctx.fillStyle = '#64748b';
    ctx.font = '400 14px system-ui,sans-serif';
    ctx.fillText(`Generado: ${this.nowLocal()}`, leftX, cardY + cardH - 28);
    ctx.textAlign = 'right';
    ctx.fillText('Presenta este código en el check-in', cardX + cardW - 34, cardY + cardH - 28);

    return canvas.toDataURL('image/png');
  }
}
