import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButton, IonButtons, IonList, IonItem, IonLabel, IonBadge
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-recepcionista-habitaciones',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButton, IonButtons, IonList, IonItem, IonLabel, IonBadge
  ],
  templateUrl: './recepcionista-habitaciones.page.html',
  styleUrls: ['./recepcionista-habitaciones.page.scss']
})
export class RecepcionistaHabitacionesPage {
  authDb: any;
  nav: any;

  constructor() { }

  ngOnInit() {
  }
  
  logout(ev?: Event) {
    ev?.preventDefault();
    this.authDb.logout();
    this.nav.navigateRoot('/login');
  }
}

