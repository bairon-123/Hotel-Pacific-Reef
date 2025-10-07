
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule, NavController, ToastController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthDbService, Reserva } from '../../services/auth-db.service';

@Component({
  selector: 'app-recepcionista-checkin',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './recepcionista-checkin.page.html'
})
export class RecepcionistaCheckinPage implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  isScanning = false;
  stream: MediaStream | null = null;
  reservaSeleccionada: Reserva | null = null;
  busquedaManual = '';
  resultadosBusqueda: Reserva[] = [];

  constructor(
    private authDb: AuthDbService,
    private nav: NavController,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  async ngOnInit() {
    await this.authDb.init();
  }

  async toggleScan() {
    if (this.isScanning) {
      this.detenerEscaneo();
    } else {
      await this.iniciarEscaneo();
    }
  }

  async iniciarEscaneo() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      this.videoElement.nativeElement.srcObject = this.stream;
      this.isScanning = true;
      
      // Aquí integrarías una librería de escaneo QR como jsQR
      this.escanearQR();
      
    } catch (error) {
      this.mostrarError('No se pudo acceder a la cámara');
    }
  }

  detenerEscaneo() {
    this.isScanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  async escanearQR() {
    // Implementación básica de escaneo QR
    // En una implementación real usarías jsQR o similar
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    
    const procesarFrame = () => {
      if (!this.isScanning) return;
      
      const video = this.videoElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Aquí iría el procesamiento real del QR
      // Por ahora es simulado
      
      requestAnimationFrame(procesarFrame);
    };
    
    procesarFrame();
  }

  buscarReservaManual() {
    if (!this.busquedaManual.trim()) {
      this.resultadosBusqueda = [];
      return;
    }

    const todasReservas = this.authDb.listReservations();
    const busqueda = this.busquedaManual.toLowerCase();
    
    this.resultadosBusqueda = todasReservas.filter(reserva =>
      reserva.id.toString().includes(busqueda) ||
      reserva.datosHuesped?.nombreCompleto.toLowerCase().includes(busqueda) ||
      reserva.datosHuesped?.email.toLowerCase().includes(busqueda) ||
      reserva.nombreHabitacion.toLowerCase().includes(busqueda)
    ).slice(0, 10); // Limitar resultados
  }

  seleccionarReserva(reserva: Reserva) {
    this.reservaSeleccionada = reserva;
    this.resultadosBusqueda = [];
    this.busquedaManual = '';
  }

  async procesarCheckin() {
    if (!this.reservaSeleccionada) return;

    // Verificar si el QR ya fue usado
    if (this.reservaSeleccionada.qrUsado) {
      const alert = await this.alert.create({
        header: 'QR Ya Utilizado',
        message: 'Esta reserva ya fue registrada anteriormente.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      // Usar el método específico del servicio en lugar de manipular directamente
      const sessionEmail = this.authDb.getSessionEmail();
      if (!sessionEmail) {
        this.mostrarError('No hay sesión activa');
        return;
      }

      this.authDb.registrarCheckin(this.reservaSeleccionada.id, sessionEmail);
      
      this.mostrarExito('Check-in registrado exitosamente');
      this.reservaSeleccionada = null;
      
    } catch (error: any) {
      this.mostrarError(error.message || 'Error al registrar check-in');
    }
  }

  irAPagos() {
    if (this.reservaSeleccionada) {
      this.nav.navigateForward('/recepcionista/pagos', {
        state: { reservaId: this.reservaSeleccionada.id }
      });
    }
  }

  async generarNuevoQR() {
    if (!this.reservaSeleccionada) return;
    
    try {
      const nuevoQR = this.authDb.generarNuevoQR(this.reservaSeleccionada.id);
      this.authDb.attachQrToReservation(
        this.reservaSeleccionada.id, 
        nuevoQR.qrImage, 
        nuevoQR.qrPayload
      );
      
      this.mostrarExito('Nuevo QR generado exitosamente');
    } catch (error: any) {
      this.mostrarError(error.message || 'Error al generar nuevo QR');
    }
  }

  async mostrarExito(mensaje: string) {
    const toast = await this.toast.create({
      message: mensaje,
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toast.create({
      message: mensaje,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }

  ngOnDestroy() {
    this.detenerEscaneo();
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }
}

