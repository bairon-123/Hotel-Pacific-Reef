import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
  IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonText
} from '@ionic/angular/standalone';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { AuthDbService, Reserva } from '../../services/auth-db.service';
import jsQR from 'jsqr';

@Component({
  selector: 'app-recepcionista-checkin',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    RouterLink, RouterLinkActive,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
    IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonText
  ],
  templateUrl: './recepcionista-checkin.page.html',
  styleUrls: ['./recepcionista-checkin.page.scss']
})
export class RecepcionistaCheckinPage implements OnInit, OnDestroy {
  @ViewChild('videoEl')  videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  isScanning = false;
  stream: MediaStream | null = null;

  reservaSeleccionada: Reserva | null = null;
  busquedaManual = '';
  resultadosBusqueda: Reserva[] = [];

  constructor(
    private db: AuthDbService,
    private nav: NavController,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  async ngOnInit() {
    await this.db.init();
    const st = history.state;
    if (st?.reservaId) {
      const r = this.db.listReservations().find(x => x.id === st.reservaId);
      if (r) this.reservaSeleccionada = r;
    }
  }

  ngOnDestroy() { this.stop(); }

  async start() {
    if (this.isScanning) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      this.videoEl.nativeElement.srcObject = this.stream;
      await this.videoEl.nativeElement.play();
      this.isScanning = true;
      this.loopScan();
    } catch {
      this.err('No se pudo acceder a la cámara.');
    }
  }

  stop() {
    this.isScanning = false;
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  async aceptarCheckin() {
    if (!this.reservaSeleccionada) return;
    if (this.reservaSeleccionada.qrUsado) {
      return this.err('Esta reserva ya fue registrada.');
    }
    const recep = this.db.getSessionEmail();
    if (!recep) return this.err('No hay sesión activa.');
    try {
      this.db.registrarCheckin(this.reservaSeleccionada.id, recep);
      await this.ok('Check-in registrado.');
      this.reservaSeleccionada = null;
    } catch (e:any) {
      this.err(e?.message || 'Error al registrar check-in.');
    }
  }

  // === QR ===
  private loopScan() {
    if (!this.isScanning) return;
    const video = this.videoEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;
    const ctx = canvas.getContext('2d');

    if (video.readyState >= 2) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (img) {
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (code?.data) {
          this.stop();
          this.handleQr(code.data);
          return;
        }
      }
    }
    requestAnimationFrame(() => this.loopScan());
  }

  private async handleQr(text: string) {
    const all = this.db.listReservations();

    let r = all.find(x => (x.qrPayload || '').trim() === text.trim());
    if (!r) {
      const m = text.match(/(\d{1,7})/);
      if (m) {
        const id = +m[1];
        r = all.find(x => x.id === id);
      }
    }

    if (!r) {
      return this.err('QR no está en sistema o caducó.');
    }

    this.reservaSeleccionada = r;
    await this.ok(`Reserva #${r.id} encontrada.`);
  }


  buscarReservaManual() {
    const q = (this.busquedaManual || '').trim().toLowerCase();
    if (!q) { this.resultadosBusqueda = []; return; }
    const todas = this.db.listReservations();
    this.resultadosBusqueda = todas.filter(r =>
      String(r.id).includes(q) ||
      (r.datosHuesped?.nombreCompleto || '').toLowerCase().includes(q) ||
      (r.datosHuesped?.email || r.email).toLowerCase().includes(q) ||
      (r.nombreHabitacion || '').toLowerCase().includes(q)
    ).slice(0, 15);
  }

  seleccionarReserva(r: Reserva) {
    this.reservaSeleccionada = r;
    this.resultadosBusqueda = [];
    this.busquedaManual = '';
  }

  irAPagos() {
    if (this.reservaSeleccionada) {
      this.nav.navigateForward('/recepcionista/pagos', { state: { reservaId: this.reservaSeleccionada.id } });
    }
  }


  async ok(msg: string) { (await this.toast.create({ message: msg, duration: 1800, color: 'success' })).present(); }
  async err(msg: string) { (await this.toast.create({ message: msg, duration: 2200, color: 'danger'  })).present(); }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.db.logout();
    this.nav.navigateRoot('/login');
  }
}
