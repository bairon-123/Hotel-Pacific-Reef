import { Injectable } from '@angular/core';

export type RoomType = 'basic' | 'medium' | 'premium';

export type UserRow = {
  email: string;           
  password_hash: string;
  created_at: string;      
  name?: string;
  role?: 'admin' | 'user' | 'recepcionista';
  telefono?: string;
  turno?: string; 
};

export type Reserva = {
  id: number;
  email: string;       
  habitacionId: number;
  nombreHabitacion: string;
  tipo: RoomType;
  llegada: string;        
  salida: string;        
  noches: number;
  precioNoche: number;
  total: number;
  createdAt: string;     
  qrImage?: string;        
  qrPayload?: string;      
  
  // Nuevos campos para recepcionista
  estadoPago: 'pagado' | 'parcial' | 'pendiente';
  porcentajePagado: number;
  qrUsado: boolean;
  fechaCheckin?: string;
  fechaCheckout?: string;
  recepcionistaCheckin?: string;
  recepcionistaCheckout?: string;
  observaciones?: string;
  datosHuesped?: {
    nombreCompleto: string;
    telefono: string;
    email: string;
    documento?: string;
  };
  habitacionAsignada?: number;
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
  estado?: 'disponible' | 'ocupada' | 'limpieza' | 'mantenimiento'; // ← Nuevo campo
};

export type RecepcionistaLog = {
  email: string;
  accion: string;
  timestamp: string;
  sessionId: string | null;
  reservaId?: number;
  detalles?: any;
};

@Injectable({ providedIn: 'root' })
export class AuthDbService {
  getProximasReservasPorHabitacion(arg0: number): { habitacion: Habitacion; reservas: Reserva[]; }[] {
    throw new Error('Method not implemented.');
  }
  listHabitacionesOcupadas(): Habitacion[] {
    throw new Error('Method not implemented.');
  }
  validateQrPayload(text: string) {
    throw new Error('Method not implemented.');
  }
  private readonly LS_USERS    = 'users_db_v1';
  private readonly LS_SESSION  = 'session_email';
  private readonly LS_RESERVAS = 'reservas_hotel_v1';
  private readonly LS_ROOMS    = 'rooms_hotel_v1';
  private readonly LS_LOGS     = 'recepcionista_logs_v1';

  async init(): Promise<void> {
    if (!localStorage.getItem(this.LS_USERS))    localStorage.setItem(this.LS_USERS, JSON.stringify([]));
    if (!localStorage.getItem(this.LS_RESERVAS)) localStorage.setItem(this.LS_RESERVAS, JSON.stringify([]));
    if (!localStorage.getItem(this.LS_LOGS))     localStorage.setItem(this.LS_LOGS, JSON.stringify([]));
    
    if (!localStorage.getItem(this.LS_ROOMS)) {
      const seed: Habitacion[] = [
        {
          id: 1, 
          nombre: 'Básica Vista Jardín', 
          tipo: 'basic', 
          precioNoche: 45000, 
          disponible: true, 
          estado: 'disponible',
          imgs: [
            'https://adx341sas12ff.enjoy.cl/BibliotecaMedios/MotorReserva/imagenes/habitacion_canal_1324.jpg',
            'https://adx341sas12ff.enjoy.cl/BibliotecaMedios/MotorReserva/imagenes/habitacion_canal_1325.jpg',
            'https://adx341sas12ff.enjoy.cl/BibliotecaMedios/MotorReserva/imagenes/habitacion_canal_1326.jpg'
          ],
          camas: '1 cama Queen',
          capacidad: 2,
          amenities: ['TV', 'Wi-Fi', 'Baño privado']
        },
        {
          id: 2, 
          nombre: 'Medium Vista Mar Parcial', 
          tipo: 'medium', 
          precioNoche: 78000, 
          disponible: true, 
          estado: 'disponible',
          imgs: [
            'https://adx341sas12ff.enjoy.cl/BibliotecaMedios/MotorReserva/imagenes/habitacion_canal_1324.jpg',
            'https://adx341sas12ff.enjoy.cl/BibliotecaMedios/MotorReserva/imagenes/habitacion_canal_1325.jpg',
            'https://adx341sas12ff.enjoy.cl/BibliotecaMedios/MotorReserva/imagenes/habitacion_canal_1326.jpg'
          ],
          camas: '1 cama King',
          capacidad: 3,
          amenities: ['TV 50”', 'A/C', 'Mini bar', 'Caja fuerte']
        },
        {
          id: 3, 
          nombre: 'Premium Vista Mar Completa', 
          tipo: 'premium', 
          precioNoche: 125000, 
          disponible: true, 
          estado: 'disponible',
          imgs: [
            'https://adx341sas12ff.enjoy.cl/BibliotecaMedios/MotorReserva/imagenes/habitacion_canal_1373.jpg',
            'https://adx341sas12ff.enjoy.cl/BibliotecaMedios/MotorReserva/imagenes/habitacion_canal_1375.jpg',
            'https://adx341sas12ff.enjoy.cl/BibliotecaMedios/MotorReserva/imagenes/habitacion_canal_1377.jpg'
          ],
          camas: '1 cama King + Sofá cama',
          capacidad: 4,
          amenities: ['Balcón privado', 'A/C', 'Cafetera', 'Batas & pantuflas']
        }
      ];
      localStorage.setItem(this.LS_ROOMS, JSON.stringify(seed));
    }
    await this.seedAdmin();
    await this.seedRecepcionista();
  }

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

  private async seedRecepcionista() {
    const users: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const recepcionistaEmail = 'recepcion@pacificreef.cl';
    if (!users.find(u => u.email === recepcionistaEmail)) {
      users.push({
        email: recepcionistaEmail,
        name: 'Recepcionista Principal',
        role: 'recepcionista',
        password_hash: await this.hash('recepcion123'),
        created_at: new Date().toISOString(),
        telefono: '+56987654321',
        turno: 'mañana'
      });
      localStorage.setItem(this.LS_USERS, JSON.stringify(users));
    }
  }

  async hash(text: string): Promise<string> {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private isStrongPassword(p: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test((p || '').trim());
  }

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

  isRecepcionista(email?: string | null): boolean {
    const target = (email ?? this.getSessionEmail() ?? '').toLowerCase();
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    return !!list.find(u => u.email === target && u.role === 'recepcionista');
  }

  isAdminOrRecepcionista(email?: string | null): boolean {
    const target = (email ?? this.getSessionEmail() ?? '').toLowerCase();
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const user = list.find(u => u.email === target);
    return !!user && (user.role === 'admin' || user.role === 'recepcionista');
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

  listRecepcionistas(): UserRow[] {
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    return list.filter(u => u.role === 'recepcionista');
  }

  async updateUser(email: string, data: { name?: string; password?: string; role?: 'admin' | 'user' | 'recepcionista'; telefono?: string; turno?: string }): Promise<void> {
    const list: UserRow[] = JSON.parse(localStorage.getItem(this.LS_USERS) || '[]');
    const i = list.findIndex(u => u.email === email.toLowerCase());
    if (i < 0) throw new Error('Usuario no encontrado');

    if (data.name !== undefined) list[i].name = data.name;
    if (data.role) list[i].role = data.role;
    if (data.telefono) list[i].telefono = data.telefono;
    if (data.turno) list[i].turno = data.turno;
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
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all.filter(r => r.email !== key)));
  }

  /* RESERVAS */
  listReservations(): Reserva[] {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    

    const migradas = all.map(reserva => ({
      ...reserva,
      estadoPago: reserva.estadoPago || 'pagado',
      porcentajePagado: reserva.porcentajePagado || 100,
      qrUsado: reserva.qrUsado || false,
      datosHuesped: reserva.datosHuesped || {
        nombreCompleto: 'Cliente ' + reserva.id,
        telefono: '+56912345678',
        email: reserva.email
      }
    }));

    if (JSON.stringify(all) !== JSON.stringify(migradas)) {
      localStorage.setItem(this.LS_RESERVAS, JSON.stringify(migradas));
    }

    return migradas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  listReservationsByEmail(email: string): Reserva[] {
    const key = email.trim().toLowerCase();
    return this.listReservations().filter(r => r.email === key);
  }

  listReservationsHoy(): Reserva[] {
    const hoy = new Date().toISOString().split('T')[0];
    return this.listReservations().filter(r => 
      r.llegada.split('T')[0] === hoy || 
      r.salida.split('T')[0] === hoy
    );
  }

  listReservacionesCheckinHoy(): Reserva[] {
    const hoy = new Date().toISOString().split('T')[0];
    return this.listReservations().filter(r => 
      r.llegada.split('T')[0] === hoy && 
      !r.qrUsado
    );
  }

  addReservation(data: Omit<Reserva, 'id' | 'createdAt' | 'email' | 'qrImage' | 'qrPayload' | 'estadoPago' | 'porcentajePagado' | 'qrUsado' | 'datosHuesped'> & { 
    email: string;
    datosHuesped?: {
      nombreCompleto: string;
      telefono: string;
      email: string;
      documento?: string;
    };
  }): Reserva {
    const all = this.listReservations();

    const email = data.email.trim().toLowerCase();
    const llegada = data.llegada;
    const salida  = data.salida;

    const noches = Math.round((+new Date(salida) - +new Date(llegada)) / 86400000);
    if (noches <= 0) throw new Error('Rango de fechas inválido.');

    if (!this.isRangeAvailable(data.habitacionId, llegada, salida)) {
      throw new Error('La habitación ya está reservada en esas fechas.');
    }

    const isExactDuplicate = all.some(r =>
      r.habitacionId === data.habitacionId &&
      r.llegada === llegada &&
      r.salida === salida &&
      r.email === email
    );
    if (isExactDuplicate) throw new Error('Esta reserva ya existe para tu cuenta.');

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
      noches,
      precioNoche: data.precioNoche,
      total: data.total,
      estadoPago: 'pagado',
      porcentajePagado: 100,
      qrUsado: false,
      datosHuesped: data.datosHuesped || {
        nombreCompleto: 'Cliente ' + id,
        telefono: '+56912345678',
        email: email
      }
    };

    all.unshift(reserva);
    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
    return reserva;
  }

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

  // Métodos para recepcionista - Gestión de check-in/out
  registrarCheckin(reservaId: number, recepcionistaEmail: string, observaciones?: string): void {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    const i = all.findIndex(r => r.id === reservaId);
    if (i === -1) throw new Error('Reserva no encontrada');

    if (all[i].qrUsado) {
      throw new Error('Esta reserva ya fue registrada (QR ya usado)');
    }

    all[i].qrUsado = true;
    all[i].fechaCheckin = new Date().toISOString();
    all[i].recepcionistaCheckin = recepcionistaEmail;
    if (observaciones) all[i].observaciones = observaciones;

    this.actualizarEstadoHabitacion(all[i].habitacionId, 'ocupada');

    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
    
    this.logRecepcionistaAction(recepcionistaEmail, `Check-in reserva #${reservaId}`, reservaId);
  }

  registrarCheckout(reservaId: number, recepcionistaEmail: string): void {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    const i = all.findIndex(r => r.id === reservaId);
    if (i === -1) throw new Error('Reserva no encontrada');

    all[i].fechaCheckout = new Date().toISOString();
    all[i].recepcionistaCheckout = recepcionistaEmail;


    this.actualizarEstadoHabitacion(all[i].habitacionId, 'limpieza');

    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
    
    this.logRecepcionistaAction(recepcionistaEmail, `Check-out reserva #${reservaId}`, reservaId);
  }

  registrarPago(reservaId: number, monto: number, metodo: string, recepcionistaEmail: string): void {
    const all: Reserva[] = JSON.parse(localStorage.getItem(this.LS_RESERVAS) || '[]');
    const i = all.findIndex(r => r.id === reservaId);
    if (i === -1) throw new Error('Reserva no encontrada');

    const reserva = all[i];
    const porcentajePagado = Math.min(100, Math.round((monto / reserva.total) * 100));
    
    reserva.porcentajePagado = porcentajePagado;
    reserva.estadoPago = porcentajePagado === 100 ? 'pagado' : 
                        porcentajePagado > 0 ? 'parcial' : 'pendiente';

    localStorage.setItem(this.LS_RESERVAS, JSON.stringify(all));
    
    this.logRecepcionistaAction(
      recepcionistaEmail, 
      `Pago registrado: ${monto} (${metodo}) para reserva #${reservaId}`,
      reservaId,
      { monto, metodo, porcentajePagado }
    );
  }

  generarNuevoQR(reservaId: number): { qrImage: string; qrPayload: string } {
    return {
      qrImage: 'data:image/png;base64,nuevo_qr_generado',
      qrPayload: `Nuevo QR para reserva #${reservaId} - ${new Date().toISOString()}`
    };
  }

  isRangeOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
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

  listRooms(): Habitacion[] {
    const all: Habitacion[] = JSON.parse(localStorage.getItem(this.LS_ROOMS) || '[]');
    
    const migradas = all.map(hab => ({
      ...hab,
      estado: hab.estado || 'disponible'
    }));


    if (JSON.stringify(all) !== JSON.stringify(migradas)) {
      localStorage.setItem(this.LS_ROOMS, JSON.stringify(migradas));
    }

    return migradas.sort((a, b) => a.id - b.id);
  }

  actualizarEstadoHabitacion(habitacionId: number, estado: 'disponible' | 'ocupada' | 'limpieza' | 'mantenimiento'): void {
    const list = this.listRooms();
    const i = list.findIndex(r => r.id === habitacionId);
    if (i === -1) throw new Error('Habitación no encontrada');

    list[i].estado = estado;
    list[i].disponible = estado === 'disponible';
    
    localStorage.setItem(this.LS_ROOMS, JSON.stringify(list));
  }

  getHabitacionConReserva(habitacionId: number): { habitacion: Habitacion, reserva: Reserva | null } {
    const habitacion = this.listRooms().find(h => h.id === habitacionId);
    if (!habitacion) throw new Error('Habitación no encontrada');

    const hoy = new Date().toISOString().split('T')[0];
    const reserva = this.listReservations().find(r => 
      r.habitacionId === habitacionId && 
      r.llegada.split('T')[0] === hoy &&
      !r.qrUsado
    );

    return { habitacion, reserva: reserva || null };
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

  logRecepcionistaAction(email: string, accion: string, reservaId?: number, detalles?: any): void {
    const logs: RecepcionistaLog[] = JSON.parse(localStorage.getItem(this.LS_LOGS) || '[]');
    logs.push({
      email,
      accion,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionEmail(),
      reservaId,
      detalles
    });
    localStorage.setItem(this.LS_LOGS, JSON.stringify(logs));
  }

  getRecepcionistaLogs(): RecepcionistaLog[] {
    return JSON.parse(localStorage.getItem(this.LS_LOGS) || '[]');
  }

  getLogsPorRecepcionista(email: string): RecepcionistaLog[] {
    const logs = this.getRecepcionistaLogs();
    return logs.filter(log => log.email === email)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getLogsPorReserva(reservaId: number): RecepcionistaLog[] {
    const logs = this.getRecepcionistaLogs();
    return logs.filter(log => log.reservaId === reservaId)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  reportTotalsByMonth(): { mes: string; total: number }[] {
    const map = new Map<string, number>();
    for (const r of this.listReservations()) {
      const mes = (r.llegada || r.createdAt).slice(0, 7);
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

  reportCheckinsHoy(): { total: number; realizados: number; pendientes: number } {
    const reservasHoy = this.listReservacionesCheckinHoy();
    const realizados = reservasHoy.filter(r => r.qrUsado).length;
    
    return {
      total: reservasHoy.length,
      realizados: realizados,
      pendientes: reservasHoy.length - realizados
    };
  }

  reportEstadoHabitaciones(): { estado: string; cantidad: number }[] {
    const habitaciones = this.listRooms();
    const map = new Map<string, number>();
    
    habitaciones.forEach(h => {
      const estado = h.estado || 'disponible';
      map.set(estado, (map.get(estado) || 0) + 1);
    });
    
    return [...map.entries()].map(([estado, cantidad]) => ({ estado, cantidad }));
  }

  reportPagosPendientes(): Reserva[] {
    const hoy = new Date().toISOString().split('T')[0];
    return this.listReservations().filter(r => 
      r.llegada.split('T')[0] === hoy && 
      r.estadoPago !== 'pagado'
    );
  }

  // Método para detectar posibles overbookings
  detectarOverbookings(): { habitacionId: number; nombre: string; reservas: Reserva[] }[] {
    const hoy = new Date().toISOString().split('T')[0];
    const reservasHoy = this.listReservations().filter(r => 
      r.llegada.split('T')[0] === hoy && 
      !r.qrUsado
    );
    
    const map = new Map<number, Reserva[]>();
    
    reservasHoy.forEach(r => {
      if (!map.has(r.habitacionId)) {
        map.set(r.habitacionId, []);
      }
      map.get(r.habitacionId)!.push(r);
    });
    
    return [...map.entries()]
      .filter(([_, reservas]) => reservas.length > 1)
      .map(([habitacionId, reservas]) => ({
        habitacionId,
        nombre: reservas[0].nombreHabitacion,
        reservas
      }));
  }
  // recepcionista ===


private onlyDate(iso: string): string { return (iso || '').slice(0,10); }
private addDaysISO(baseISO: string, days: number): string {
  const d = new Date(baseISO + 'T00:00:00'); d.setDate(d.getDate()+days);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), da = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
}


listProximosCheckins(dias = 7): Reserva[] {
  const hoy = new Date().toISOString().slice(0,10);
  const limite = this.addDaysISO(hoy, dias);
  return this.listReservations().filter(r =>
    !r.qrUsado &&
    this.onlyDate(r.llegada) >= hoy &&
    this.onlyDate(r.llegada) <= limite
  ).sort((a,b)=> a.llegada.localeCompare(b.llegada));
}


countReservasMesActual(): number {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  return this.listReservations().filter(r => (r.llegada || r.createdAt).startsWith(ym)).length;
}}

