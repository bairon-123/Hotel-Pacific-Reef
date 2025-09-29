import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController,NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthDbService, Habitacion, RoomType } from '../../services/auth-db.service';
type Mode = 'add' | 'edit';


@Component({
  selector: 'app-admin-habitaciones',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './admin-habitaciones.page.html',
  styleUrls: ['./admin-habitaciones.page.scss']
})
export class AdminHabitacionesPage implements OnInit {
  rooms: Habitacion[] = [];
  isModalOpen = false;
  mode: Mode = 'add';

  // modelo del formulario
  form: Habitacion = {
    id: 0,
    nombre: '',
    tipo: 'basic',
    precioNoche: 0,
    disponible: true,
    imgs: [''],
    descripcion: '',
    capacidad: 2
  };


  constructor(
    private db: AuthDbService,
    private auth: AuthDbService,
    private nav: NavController,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  async ngOnInit() {
    await this.db.init();
    this.load();
  }

  load() {
    this.rooms = this.db.listRooms();
  }

  // UI helpers
  openAdd() {
    this.mode = 'add';
    this.form = {
      id: 0,
      nombre: '',
      tipo: 'basic',
      precioNoche: 0,
      disponible: true,
      imgs: [''],
      descripcion: '',
      capacidad: 2
    };
    this.isModalOpen = true;
  }

  openEdit(r: Habitacion) {
    this.mode = 'edit';
    // clonar para no mutar la lista hasta guardar
    this.form = JSON.parse(JSON.stringify(r));
    if (!this.form.imgs || !this.form.imgs.length) this.form.imgs = [''];
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  addImgField() {
    if (!this.form.imgs) this.form.imgs = [''];
    this.form.imgs.push('');
  }

  removeImgField(i: number) {
    if (!this.form.imgs) return;
    this.form.imgs.splice(i, 1);
    if (this.form.imgs.length === 0) this.form.imgs.push('');
  }

  trackByIndex(_: number, item: any) { return item; }

  // Validación mínima
  private validate(): string | null {
    if (!this.form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!['basic','medium','premium'].includes(this.form.tipo)) return 'Tipo inválido.';
    if (this.form.precioNoche <= 0) return 'El precio por noche debe ser mayor a 0.';
    // filtrar urls vacías
    this.form.imgs = (this.form.imgs || []).map(s => s?.trim()).filter(Boolean);
    if (this.form.imgs.length === 0) return 'Debe ingresar al menos 1 URL de imagen.';
    if (!this.form.capacidad || this.form.capacidad <= 0) return 'Capacidad inválida.';
    return null;
  }

  async save() {
    const err = this.validate();
    if (err) return this.msg(err);

    // upsert
    const saved = this.db.upsertRoom(this.form);
    this.msg(this.mode === 'add' ? 'Habitación creada' : 'Habitación actualizada', 'success');
    this.isModalOpen = false;
    this.load();
  }

  async confirmDelete(r: Habitacion) {
    const a = await this.alert.create({
      header: 'Eliminar habitación',
      message: `¿Seguro que quieres eliminar <b>${r.nombre}</b>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.del(r) }
      ]
    });
    a.present();
  }

  del(r: Habitacion) {
    this.db.deleteRoom(r.id);
    this.msg('Habitación eliminada', 'success');
    this.load();
  }

  // UX
  async msg(text: string, color: 'danger' | 'success' | 'medium' = 'danger') {
    (await this.toast.create({ message: text, duration: 2000, color, position: 'bottom' })).present();
  }

  currency(v: number) {
    return v.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

  tipoLabel(t: RoomType) {
    return t === 'basic' ? 'Básica' : t === 'medium' ? 'Medium' : 'Premium';
  }


  // ⬅️ nuevo método
  logout(ev?: Event) {
    ev?.preventDefault();
    this.auth.logout();
    this.nav.navigateRoot('/login');
  }
}