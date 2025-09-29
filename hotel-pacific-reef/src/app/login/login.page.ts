import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, NavController, IonInput } from '@ionic/angular';
import { AuthDbService } from '../services/auth-db.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  showPass = false;
  isLoading = false;

  // Registro
  registerOpen = false;
  regEmail = '';
  regPass = '';
  regPass2 = '';
  regShowPass = false;

  // CAPTCHA (texto en imagen)
  captchaText = '';
  captchaImage = '';     // dataURL del canvas
  captchaInput = '';
  captchaError = '';

  @ViewChild('passInput', { static: false }) passInput?: IonInput;

  constructor(
    private auth: AuthDbService,
    private toast: ToastController,
    private nav: NavController
  ) {}

  async ngOnInit() {
    await this.auth.init();
    // si ya está logueado, redirige según rol
    const logged = this.auth.getSessionEmail();
    if (logged) {
      const to = this.auth.isAdmin() ? '/admin' : '/home';
      this.nav.navigateRoot(to);
      return;
    }
    // primer captcha
    this.regenCaptcha();
  }

  /* =================== CAPTCHA =================== */

  regenCaptcha() {
    // Evitar caracteres confusos O/0, I/1, l, etc.
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const len = 5 + Math.floor(Math.random() * 2); // 5-6
    let text = '';
    for (let i = 0; i < len; i++) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }
    this.captchaText = text;
    this.captchaImage = this.generateCaptchaImage(text);
    this.captchaInput = '';
    this.captchaError = '';
  }

  private generateCaptchaImage(text: string): string {
    const w = 180, h = 64;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    // fondo
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#eef2ff');
    grd.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // líneas de ruido
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(30,41,59,${0.1 + Math.random()*0.2})`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    // texto con pequeñas rotaciones
    const baseX = 20;
    let x = baseX;
    for (const ch of text) {
      const fontSize = 26 + Math.floor(Math.random() * 6); // 26-32
      const angle = (Math.random() - 0.5) * 0.4; // -0.2..0.2 rad
      ctx.save();
      ctx.translate(x, h / 2);
      ctx.rotate(angle);
      ctx.font = `700 ${fontSize}px sans-serif`;
      ctx.fillStyle = '#1f2937';
      ctx.shadowColor = 'rgba(0,0,0,.15)';
      ctx.shadowBlur = 2;
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      x += fontSize - 4;
    }

    // puntos de ruido
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas.toDataURL('image/png');
  }

checkCaptchaEmpty() {
  if (!(this.captchaInput || '').trim()) {
    this.captchaError = 'Debes ingresar el texto del CAPTCHA.';
  }
}

private validateCaptcha(): boolean {
  const raw = (this.captchaInput || '').trim();

  // vacío -> error y NO regeneramos la imagen
  if (!raw) {
    this.captchaError = 'Debes ingresar el texto del CAPTCHA.';
    return false;
  }

  // comparar sin espacios y sin sensibilidad a mayúsculas
  const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  if (norm(raw) !== norm(this.captchaText)) {
    this.captchaError = 'Captcha incorrecto. Inténtalo de nuevo.';
    this.regenCaptcha(); // solo regeneramos si está mal
    return false;
  }

  this.captchaError = '';
  return true;
}


  /* =================== LOGIN =================== */
  async onLogin() {
    if (!this.validEmail(this.email) || !this.password) {
      return this.msg('Completa correo y contraseña válidos.');
    }
    // Verificar captcha antes de intentar login
    if (!this.validateCaptcha()) return;

    this.isLoading = true;
    try {
      const ok = await this.auth.login(this.email, this.password);
      if (!ok) return this.msg('Credenciales inválidas.');
      this.msg('¡Bienvenido!', 'success');

      const to = this.auth.isAdmin() ? '/admin' : '/home';
      this.nav.navigateRoot(to);
    } catch (e: any) {
      this.msg(e?.message || 'Error al iniciar sesión.');
    } finally {
      this.isLoading = false;
    }
  }

  fillAdminEmail() {
    this.email = 'admin@pacificreef.cl';
    setTimeout(() => this.passInput?.setFocus(), 0);
  }

  /* =================== REGISTRO =================== */
  openRegister(ev: Event) { ev.preventDefault(); this.registerOpen = true; }

  async onRegister() {
    if (!this.validEmail(this.regEmail)) return this.msg('Correo inválido.');
    // misma política que el servicio (8+ con may/min/num)
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(this.regPass || '');
    if (!strong) return this.msg('La contraseña debe tener 8+ caracteres, con mayúscula, minúscula y número.');
    if (this.regPass !== this.regPass2) return this.msg('Las contraseñas no coinciden.');

    this.isLoading = true;
    try {
      await this.auth.register(this.regEmail, this.regPass, undefined);
      this.msg('Cuenta creada. Ahora puedes iniciar sesión.', 'success');
      this.registerOpen = false;
      this.email = this.regEmail;
      this.password = this.regPass;
      this.regEmail = this.regPass = this.regPass2 = '';
    } catch (e:any) {
      this.msg(e?.message || 'No se pudo crear la cuenta.');
    } finally {
      this.isLoading = false;
    }
  }

  forgot(ev: Event) { ev.preventDefault(); this.msg('Recuperación disponible pronto.'); }

  /* =================== HELPERS =================== */
  private validEmail(v: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  private async msg(text: string, color: 'danger'|'success'|'medium'='danger') {
    const t = await this.toast.create({ message: text, duration: 1800, color, position: 'bottom' });
    await t.present();
  }
}
