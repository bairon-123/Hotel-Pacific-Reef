import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController,NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthDbService, UserRow } from '../../services/auth-db.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './admin-usuarios.page.html',
  styleUrls: ['./admin-usuarios.page.scss']
})
export class AdminUsuariosPage implements OnInit {
  users: UserRow[] = [];
  sessionEmail: string | null = null;
  q = ''; // búsqueda simple

  constructor(
    private db: AuthDbService,
    private alert: AlertController,
    private auth: AuthDbService,   
    private nav: NavController,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    await this.db.init();
    this.sessionEmail = this.db.getSessionEmail();
    this.load();
  }

  load() {
    const all = this.db.listUsers();
    const q = (this.q || '').toLowerCase().trim();
    this.users = q ? all.filter((u: { email?: string; name?: string; }) =>
      (u.email?.toLowerCase().includes(q)) ||
      (u.name?.toLowerCase().includes(q))
    ) : all;
  }

  countAdmins(): number {
    return this.db.listUsers().filter((u: UserRow) => u.role === 'admin').length;
  }

  /* ====== Crear usuario ====== */
  async createUser() {
    const a = await this.alert.create({
      header: 'Nuevo usuario',
      inputs: [
        { name: 'email', type: 'email', placeholder: 'correo@ejemplo.com' },
        { name: 'name',  type: 'text',  placeholder: 'Nombre (opcional)' },
        { name: 'pass',  type: 'password', placeholder: 'Contraseña (6+)' },
        { name: 'isAdmin', type: 'checkbox', label: 'Hacer administrador', checked: false }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: async (d: any) => {
            try {
              await this.db.register(String(d.email || ''), String(d.pass || ''), d.name || undefined);
              if (d.isAdmin) {
                await this.db.updateUser(String(d.email || ''), { role: 'admin' });
              }
              this.ok('Usuario creado');
              this.load();
            } catch (e:any) {
              this.err(e?.message || 'Error al crear usuario');
            }
          }
        }
      ]
    });
    a.present();
  }

  /* ====== Editar nombre ====== */
  async editName(u: UserRow) {
    const a = await this.alert.create({
      header: `Editar nombre`,
      inputs: [{ name: 'name', type: 'text', value: u.name || '', placeholder: 'Nombre' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (d:any) => {
            try {
              await this.db.updateUser(u.email, { name: String(d.name || '').trim() });
              this.ok('Nombre actualizado');
              this.load();
            } catch (e:any) {
              this.err(e?.message || 'No se pudo actualizar');
            }
          }
        }
      ]
    });
    a.present();
  }

  /* ====== Cambiar contraseña ====== */
  async editPass(u: UserRow) {
    const a = await this.alert.create({
      header: `Cambiar contraseña`,
      inputs: [{ name: 'pass', type: 'password', placeholder: 'Nueva contraseña (6+)' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (d:any) => {
            try {
              const pass = String(d.pass || '');
              if (pass.length < 6) throw new Error('Debe tener al menos 6 caracteres');
              await this.db.updateUser(u.email, { password: pass });
              this.ok('Contraseña actualizada');
            } catch (e:any) {
              this.err(e?.message || 'No se pudo actualizar');
            }
          }
        }
      ]
    });
    a.present();
  }

  /* ====== Cambiar rol ====== */
  async toggleRole(u: UserRow) {
    try {
      const makeAdmin = u.role !== 'admin';
      if (!makeAdmin) {
        // está por perder admin → no dejar sin admins
        if (this.countAdmins() <= 1) {
          throw new Error('No puedes dejar el sistema sin al menos un administrador.');
        }
      }
      await this.db.updateUser(u.email, { role: makeAdmin ? 'admin' : 'user' });
      this.ok(makeAdmin ? 'Ahora es administrador' : 'Rol cambiado a usuario');
      this.load();
    } catch (e:any) {
      this.err(e?.message || 'No se pudo cambiar el rol');
    }
  }

  /* ====== Eliminar usuario ====== */
  async confirmDelete(u: UserRow) {
    const a = await this.alert.create({
      header: 'Eliminar usuario',
      message: `¿Eliminar <b>${u.email}</b>? Esta acción es irreversible.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive', handler: () => this.delete(u)
        }
      ]
    });
    a.present();
  }

  delete(u: UserRow) {
    try {
      if (u.email === this.sessionEmail) {
        throw new Error('No puedes eliminar tu propia cuenta iniciada.');
      }
      if (u.role === 'admin' && this.countAdmins() <= 1) {
        throw new Error('Debe quedar al menos un administrador.');
      }
      this.db.deleteUser(u.email);
      this.ok('Usuario eliminado');
      this.load();
    } catch (e:any) {
      this.err(e?.message || 'No se pudo eliminar');
    }
  }

  /* ====== Utils ====== */
  async ok(m: string) {
    (await this.toast.create({ message: m, duration: 1800, color: 'success' })).present();
  }
  async err(m: string) {
    (await this.toast.create({ message: m, duration: 2200, color: 'danger' })).present();
  }




  // ⬅️ nuevo método
  logout(ev?: Event) {
    ev?.preventDefault();
    this.auth.logout();
    this.nav.navigateRoot('/login');
  }
}

