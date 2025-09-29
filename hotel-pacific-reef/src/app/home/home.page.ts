import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { AuthDbService } from '../services/auth-db.service';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  currentEmail: string | null = null;

  constructor(
    private auth: AuthDbService, 
    private nav: NavController,
    private translationService: TranslationService
  ) {}

  async ngOnInit() {
    await this.auth.init?.();
    this.currentEmail = this.auth.getSessionEmail();

    if (!this.currentEmail) this.nav.navigateRoot('/login');
  }

  logout(ev?: Event) {
    ev?.preventDefault();
    this.auth.logout();
    this.nav.navigateRoot('/login');
  }
}

