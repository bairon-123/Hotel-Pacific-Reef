import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonIcon
} from '@ionic/angular/standalone';
import { AuthDbService, Habitacion, Reserva } from '../../services/auth-db.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-recepcionista-habitaciones',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonIcon
  ],
  templateUrl: './recepcionista-habitaciones.page.html',
  styleUrls: ['./recepcionista-habitaciones.page.scss']
})
export class RecepcionistaHabitacionesPage implements OnInit {
  ocupadas: Habitacion[] = [];
  proximasPorHab: Array<{ habitacion: Habitacion; reservas: Reserva[] }> = [];

  constructor(private db: AuthDbService, private nav: NavController) {}

  async ngOnInit() {
    await this.db.init();
    this.ocupadas = this.db.listHabitacionesOcupadas();
    this.proximasPorHab = this.db.getProximasReservasPorHabitacion(7);
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.db.logout();
    this.nav.navigateRoot('/login');
  }
}
