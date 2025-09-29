import { Injectable } from '@angular/core';

/* ========= Tipos ========= */
export type RoomType = 'basic' | 'medium' | 'premium';

export type UserRow = {
  email: string;           // PK
  password_hash: string;
  created_at: string;      // ISO
  name?: string;
  role?: 'admin' | 'user';
};

export type Reserva = {
  id: number;
  email: string;           // dueño (normalizado a lower)
  habitacionId: number;
  nombreHabitacion: string;
  tipo: RoomType;
  llegada: string;         // YYYY-MM-DD
  salida: string;          // YYYY-MM-DD (checkout)
  noches: number;
  precioNoche: number;
  total: number;
  createdAt: string;       // ISO
  // === NUEVO para QR ===
  qrImage?: string;        // PNG en data URL
  qrPayload?: string;      // Texto/JSON usado para generar el QR
};

export type Habitacion = {
  id: number;
  nombre: string;
  tipo: RoomType;
  precioNoche: number;
  disponible: boolean;
  imgs: string[];
  descripcion?: string;
  capacidad?: number;
  camas?: string;
  amenities?: string[];
};

@Injectable({ providedIn: 'root' })
export class AuthDbService {
  private readonly LS_USERS    = 'users_db_v1';
  private readonly LS_SESSION  = 'session_email';
  private readonly LS_RESERVAS = 'reservas_hotel_v1';
  private readonly LS_ROOMS    = 'rooms_hotel_v1';

  /** Inicializa “BD” web: tablas, habitaciones seed y super admin. */
  async init(): Promise<void> {
    if (!localStorage.getItem(this.LS_USERS))    localStorage.setItem(this.LS_USERS, JSON.stringify([]));
    if (!localStorage.getItem(this.LS_RESERVAS)) localStorage.setItem(this.LS_RESERVAS, JSON.stringify([]));
    if (!localStorage.getItem(this.LS_ROOMS)) {
      const seed: Habitacion[] = [
        {
          id: 1, nombre: 'Básica Vista Jardín', tipo: 'basic', precioNoche: 45000, disponible: true, imgs: [
            'https://images.unsplash.com/photo-1559599238-0cf17d6d3530?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1551776235-dde6d4829808?q=80&w=1200&auto=format&fit=crop'
          ],
          camas: '1 cama Queen',
          capacidad: 2,
          amenities: ['TV', 'Wi-Fi', 'Baño privado']
        },
        {
          id: 2, nombre: 'Medium Vista Mar Parcial', tipo: 'medium', precioNoche: 78000, disponible: true, imgs: [
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop'
          ],
          camas: '1 cama King',
          capacidad: 3,
          amenities: ['TV 50”', 'A/C', 'Mini bar', 'Caja fuerte']
        },
        {
          id: 3, nombre: 'Premium Vista Mar Completa', tipo: 'premium', precioNoche: 125000, disponible: true, imgs: [
            'https://images.unsplash.com/photo-1505691723518-36a5ac3b2bc5?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505692952047-1a78307da8f3?q=80&w=1200&auto=format&fit=crop'
          ],
          camas: '1 cama King + Sofá cama',
          capacidad: 4,
          amenities: ['Balcón privado', 'A/C', 'Cafetera', 'Batas & pantuflas']
        }
      ];
      localStorage.setItem(this.LS_ROOMS, JSON.stringify(seed));
    }
    await this.seedAdmin();
  }

  /** Crea superusuario si no existe. */
  private async seedAdmin() {
    const users: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const adminEmail = 'admin@pacificreef.cl';
    if (!users.find(u => u.email === adminEmail)) {
      users.push({
        email: adminEmail,
        name: 'Super Admin',
        role: 'admin',
        password_hash: await this.hash('admin123'),
        created_at: new Date().toISOString()
      });
      localStorage.setItem(this.LS_USERS, JSON.stringify(users));
    }
  }

  /* ======== UTIL: hash y password policy ======== */
  async hash(text: string): Promise<string> {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  private isStrongPassword(p: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test((p || '').trim());
  }

  /* ======== AUTH / USERS ======== */
  async register(email: string, password: string, _unused?: any): Promise<void> {
    email = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Correo inválido.');
    if (!this.isStrongPassword(password)) {
      throw new Error('La contraseña debe tener 8+ caracteres, con mayúscula, minúscula y número.');
    }

    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    if (list.find(u => u.email === email)) throw new Error('El correo ya está registrado.');

    list.push({
      email,
      password_hash: await this.hash(password),
      created_at: new Date().toISOString(),
      role: 'user'
    });
    localStorage.setItem(this.LS_USERS, JSON.stringify(list));
  }

  async login(email: string, password: string): Promise<boolean> {
    email = email.trim().toLowerCase();
    const passHash = await this.hash(password);
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const row = list.find(u => u.email === email);
    const ok = !!row && row.password_hash === passHash;
    if (ok) localStorage.setItem(this.LS_SESSION, email);
    return ok;
  }

  logout(): void { localStorage.removeItem(this.LS_SESSION); }
  getSessionEmail(): string | null { return localStorage.getItem(this.LS_SESSION); }

  isAdmin(email?: string | null): boolean {
    const target = (email ?? this.getSessionEmail() ?? '').toLowerCase();
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    return !!list.find(u => u.email === target && u.role === 'admin');
  }

  async changePassword(email: string, currentPass: string, newPass: string): Promise<void> {
    email = email.trim().toLowerCase();
    if (!this.isStrongPassword(newPass)) {
      throw new Error('La nueva contraseña debe tener 8+ caracteres, con mayúscula, minúscula y número.');
    }
    const ok = await this.login(email, currentPass);
    if (!ok) throw new Error('La contraseña actual no es correcta.');

    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const idx = list.findIndex(u => u.email === email);
    if (idx === -1) throw new Error('Cuenta no encontrada.');
    list[idx].password_hash = await this.hash(newPass);
    localStorage.setItem(this.LS_USERS, JSON.stringify(list));
  }

  async deleteAccount(email: string): Promise<void> {
    const key = email.trim().toLowerCase();
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    localStorage.setItem(this.LS_USERS, JSON.stringify(list.filter(u => u.email !== key)));
    this.clearReservationsFor(key);
    if (this.getSessionEmail() === key) this.logout();
  }

  listUsers(): UserRow[] {
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    return list.sort((a, b) => a.email.localeCompare(b.email));
  }

  async updateUser(email: string, data: { name?: string; password?: string; role?: 'admin' | 'user' }): Promise<void> {
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const i = list.findIndex(u => u.email === email.toLowerCase());
    if (i < 0) throw new Error('Usuario no encontrado');

    if (data.name !== undefined) list[i].name = data.name;
    if (data.role) list[i].role = data.role;
    if (data.password) {
      if (!this.isStrongPassword(data.password)) {
        throw new Error('La contraseña debe tener 8+ caracteres, con mayúscula, minúscula y número.');
      }
      list[i].password_hash = await this.hash(data.password);
    }
    localStorage.setItem(this.LS_USERS, JSON.stringify(list));
  }

  deleteUser(email: string): void {
    const key = email.toLowerCase();
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    localStorage.setItem(this.LS_USERS, JSON.stringify(list.filter(u => u.email !== key)));
    // borra también reservas
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all.filter(r => r.email !== key)));
  }

  /* ======== RESERVAS ======== */
  listReservations(): Reserva[] {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  listReservationsByEmail(email: string): Reserva[] {
    const key = email.trim().toLowerCase();
    return this.listReservations().filter(r => r.email === key);
  }

  /** Agrega una reserva garantizando unicidad (sin solapamientos) y evitando duplicados exactos. */
  addReservation(data: Omit<Reserva, 'id' | 'createdAt' | 'email' | 'qrImage' | 'qrPayload'> & { email: string }): Reserva {
    const all = this.listReservations();

    const email = data.email.trim().toLowerCase();
    const llegada = data.llegada;
    const salida  = data.salida;

    // 1) Rango válido (noches calculadas por seguridad)
    const noches = Math.round((+new Date(salida) - +new Date(llegada)) / 86400000);
    if (noches <= 0) throw new Error('Rango de fechas inválido.');

    // 2) Evitar solapamientos para la misma habitación
    if (!this.isRangeAvailable(data.habitacionId, llegada, salida)) {
      throw new Error('La habitación ya está reservada en esas fechas.');
    }

    // 3) Evitar duplicado exacto (misma hab + mismas fechas + mismo usuario)
    const isExactDuplicate = all.some(r =>
      r.habitacionId === data.habitacionId &&
      r.llegada === llegada &&
      r.salida === salida &&
      r.email === email
    );
    if (isExactDuplicate) throw new Error('Esta reserva ya existe para tu cuenta.');

    // 4) Crear
    const id = (all.reduce((mx, r) => Math.max(mx, r.id), 0) || 0) + 1;
    const createdAt = new Date().toISOString();

    const reserva: Reserva = {
      id,
      createdAt,
      email,
      habitacionId: data.habitacionId,
      nombreHabitacion: data.nombreHabitacion,
      tipo: data.tipo,
      llegada,
      salida,
      noches, // (recalculated)
      precioNoche: data.precioNoche,
      total: data.total
    };

    all.unshift(reserva);
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
    return reserva;
  }

  /** Adjunta imagen QR y payload a una reserva existente. */
  attachQrToReservation(id: number, qrImage: string, qrPayload: string): void {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    const i = all.findIndex(r => r.id === id);
    if (i === -1) throw new Error('Reserva no encontrada para adjuntar QR');
    all[i].qrImage = qrImage;
    all[i].qrPayload = qrPayload;
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
  }

  removeReservation(id: number): void {
    const all = this.listReservations().filter(r => r.id !== id);
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
  }

  clearReservationsFor(email: string): void {
    const key = email.trim().toLowerCase();
    const all = this.listReservations().filter(r => r.email !== key);
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
  }

  // === Disponibilidad / solapamiento ===
  isRangeOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
    // intervalos semiabiertos [start, end)
    return !(aEnd <= bStart || bEnd <= aStart);
  }

  isRangeAvailable(roomId: number, start: string, end: string, excludeId?: number): boolean {
    const all = this.listReservations();
    return !all.some(r =>
      r.habitacionId === roomId &&
      (excludeId ? r.id !== excludeId : true) &&
      this.isRangeOverlap(r.llegada, r.salida, start, end)
    );
  }

  updateReservationDates(id: number, llegada: string, salida: string): void {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    const i = all.findIndex(r => r.id === id);
    if (i === -1) throw new Error('Reserva no encontrada');

    const r = all[i];
    if (!this.isRangeAvailable(r.habitacionId, llegada, salida, id)) {
      throw new Error('Fechas no disponibles para esta habitación.');
    }
    const noches = Math.round((+new Date(salida) - +new Date(llegada)) / 86400000);
    if (noches <= 0) throw new Error('Rango inválido.');

    r.llegada = llegada;
    r.salida = salida;
    r.noches = noches;
    r.total = noches * r.precioNoche;

    all[i] = r;
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
  }

  /* ======== HABITACIONES ======== */
  listRooms(): Habitacion[] {
    const all: Habitacion[] = JSON.parse(localStorage.getItem(this.LS_ROOMS) || '[]');
    return all.sort((a, b) => a.id - b.id);
  }

  upsertRoom(room: Habitacion): Habitacion {
    const list = this.listRooms();
    const i = list.findIndex(r => r.id === room.id);
    if (i >= 0) {
      list[i] = { ...room };
    } else {
      room.id = (list.reduce((mx, r) => Math.max(mx, r.id), 0) || 0) + 1;
      list.push(room);
    }
    localStorage.setItem(this.LS_ROOMS, JSON.stringify(list));
    return room;
  }

  deleteRoom(id: number): void {
    const list = this.listRooms().filter(r => r.id !== id);
    localStorage.setItem(this.LS_ROOMS, JSON.stringify(list));
  }

  /* ======== REPORTES ======== */
  reportTotalsByMonth(): { mes: string; total: number }[] {
    const map = new Map<string, number>();
    for (const r of this.listReservations()) {
      const mes = (r.llegada || r.createdAt).slice(0, 7); // YYYY-MM
      map.set(mes, (map.get(mes) || 0) + r.total);
    }
    return [...map.entries()]
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  reportTopRooms(limit = 10) {
    const map = new Map<number, { habitacionId: number; nombreHabitacion: string; veces: number }>();
    for (const r of this.listReservations()) {
      const cur = map.get(r.habitacionId) || { habitacionId: r.habitacionId, nombreHabitacion: r.nombreHabitacion, veces: 0 };
      cur.veces++;
      map.set(r.habitacionId, cur);
    }
    return [...map.values()].sort((a, b) => b.veces - a.veces).slice(0, limit);
  }
}