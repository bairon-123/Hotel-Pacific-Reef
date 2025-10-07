import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-recepcionista-pagos',
  templateUrl: './recepcionista-pagos.page.html',
  styleUrls: ['./recepcionista-pagos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RecepcionistaPagosPage implements OnInit {
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


