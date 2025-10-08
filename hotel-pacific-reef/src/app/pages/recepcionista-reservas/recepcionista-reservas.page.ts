import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButton, IonButtons
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-recepcionista-reservas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButton, IonButtons, 
  ],  
  templateUrl: './recepcionista-reservas.page.html',
  styleUrls: ['./recepcionista-reservas.page.scss']
})
export class RecepcionistaReservasPage {
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

