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

@Component({
  selector: 'app-recepcionista-checkin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    // Ionic standalone
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
    IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonText
  ],
  templateUrl: './recepcionista-checkin.page.html',
  styleUrls: ['./recepcionista-checkin.page.scss']
})
export class RecepcionistaCheckinPage implements OnInit, OnDestroy {
  @ViewChild('videoElement')  videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  // Scanner
  isScanning = false;
  stream: MediaStream | null = null;

  // Búsqueda / selección
  busquedaManual = '';
  resultadosBusqueda: Reserva[] = [];
  reservaSeleccionada: Reserva | null = null;

  constructor(
    private authDb: AuthDbService,
    private nav: NavController,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  async ngOnInit() {
    await this.authDb.init();
  }

  ngOnDestroy() {
    this.detenerEscaneo();
  }

  /* ========== Escáner ========== */
  async toggleScan() {
    if (this.isScanning) return this.detenerEscaneo();
    await this.iniciarEscaneo();
  }

  private async iniciarEscaneo() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.isScanning = true;
      this.loopEscaneo();
    } catch {
      this.mostrarError('No se pudo acceder a la cámara.');
    }
  }

  private detenerEscaneo() {
    this.isScanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  // Aquí podrías integrar jsQR; por ahora solo dibujamos frames (overlay)
  private loopEscaneo() {
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');

    const step = () => {
      if (!this.isScanning) return;
      const video = this.videoElement.nativeElement;
      if (video.readyState >= 2) {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(step);
    };
    step();
  }

  /* ========== Búsqueda manual ========== */
  buscarReservaManual() {
    const q = (this.busquedaManual || '').trim().toLowerCase();
    if (!q) { this.resultadosBusqueda = []; return; }

    const todas = this.authDb.listReservations();
    this.resultadosBusqueda = todas.filter(r =>
      r.id.toString().includes(q) ||
      (r.datosHuesped?.nombreCompleto || '').toLowerCase().includes(q) ||
      (r.datosHuesped?.email || '').toLowerCase().includes(q) ||
      (r.nombreHabitacion || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }

  seleccionarReserva(r: Reserva) {
    this.reservaSeleccionada = r;
    this.resultadosBusqueda = [];
    this.busquedaManual = '';
  }

  /* ========== Acciones ========== */
  async procesarCheckin() {
    if (!this.reservaSeleccionada) return;

    if ((this.reservaSeleccionada as any).qrUsado) {
      const a = await this.alert.create({
        header: 'QR ya utilizado',
        message: 'Esta reserva ya fue registrada anteriormente.',
        buttons: ['OK']
      });
      await a.present();
      return;
    }

    try {
      const sessionEmail = this.authDb.getSessionEmail();
      if (!sessionEmail) return this.mostrarError('No hay sesión activa.');

      await (this.authDb as any).registrarCheckin(this.reservaSeleccionada.id, sessionEmail);
      this.mostrarExito('Check-in registrado exitosamente.');
      this.reservaSeleccionada = null;
    } catch (e: any) {
      this.mostrarError(e?.message || 'Error al registrar check-in.');
    }
  }

  irAPagos() {
    if (!this.reservaSeleccionada) return;
    this.nav.navigateForward('/recepcionista/pagos', {
      state: { reservaId: this.reservaSeleccionada.id }
    });
  }

  async generarNuevoQR() {
    if (!this.reservaSeleccionada) return;
    try {
      const nuevoQR = (this.authDb as any).generarNuevoQR(this.reservaSeleccionada.id);
      this.authDb.attachQrToReservation(this.reservaSeleccionada.id, nuevoQR.qrImage, nuevoQR.qrPayload);
      this.mostrarExito('Nuevo QR generado exitosamente.');
    } catch (e: any) {
      this.mostrarError(e?.message || 'Error al generar nuevo QR.');
    }
  }

  /* ========== UI helpers ========== */
  currency(v: number | null | undefined) {
    return (v ?? 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }
  async mostrarExito(msg: string) { (await this.toast.create({ message: msg, duration: 2000, color: 'success' })).present(); }
  async mostrarError(msg: string) { (await this.toast.create({ message: msg, duration: 2800, color: 'danger'  })).present(); }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }
}
