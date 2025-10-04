import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthDbService } from '../services/auth-db.service';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { ClimaService, ClimaAhora } from '../services/clima.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    TranslatePipe
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  currentEmail: string | null = null;

  // Clima
  isLoading = false;
  error = '';
  ubicacionLabel = '—';
  clima: ClimaAhora | null = null;

  constructor(
    private auth: AuthDbService,
    private nav: NavController,
    private translationService: TranslationService,
    private climaSvc: ClimaService
  ) {}

  async ngOnInit() {
    await this.auth.init?.();
    this.currentEmail = this.auth.getSessionEmail();
    if (!this.currentEmail) {
      this.nav.navigateRoot('/login');
      return;
    }

    // Carga inicial
    this.cargarCiudad('Santiago');
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.auth.logout();
    this.nav.navigateRoot('/login');
  }

  /* ======= Clima ======= */
  cargar(lat: number, lon: number, label?: string) {
    this.isLoading = true;
    this.error = '';
    if (label) this.ubicacionLabel = label;

    this.climaSvc.getAhora(lat, lon).subscribe({
      next: (data) => {
        this.clima = data;
        this.isLoading = false;
      },
      error: (e) => {
        this.error = e?.message || 'No se pudo cargar el clima.';
        this.clima = null;
        this.isLoading = false;
      }
    });
  }

  cargarCiudad(ciudad: 'Santiago' | 'Valdivia' | 'Arica') {
    switch (ciudad) {
      case 'Santiago': this.cargar(-33.45, -70.66, 'Santiago, CL'); break;
      case 'Valdivia': this.cargar(-39.82, -73.24, 'Valdivia, CL'); break;
      case 'Arica':    this.cargar(-18.48, -70.32, 'Arica, CL'); break;
    }
  }

  usarMiUbicacion() {
    if (!('geolocation' in navigator)) {
      this.error = 'Tu navegador no permite geolocalización.';
      return;
    }
    this.isLoading = true;
    this.error = '';
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        this.cargar(latitude, longitude, 'Tu ubicación');
      },
      () => {
        this.isLoading = false;
        this.error = 'No se pudo obtener tu ubicación.';
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }

  /* ======= Helpers UI ======= */
  fmtTemp(v?: number) { return v !== undefined ? `${v} °C` : '—'; }
  fmtHum(v?: number)  { return v !== undefined ? `${v} %`  : '—'; }
}
