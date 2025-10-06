// Ejecutar una vez para migrar datos existentes
export function migrarDatosRecepcionista() {
  const reservas: any[] = JSON.parse(localStorage.getItem('reservas_hotel_v1') || '[]');
  
  const reservasActualizadas = reservas.map(reserva => ({
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
  
  localStorage.setItem('reservas_hotel_v1', JSON.stringify(reservasActualizadas));
  
  // Crear usuario recepcionista por defecto
  const users: any[] = JSON.parse(localStorage.getItem('users_db_v1') || '[]');
  if (!users.find(u => u.role === 'recepcionista')) {
    users.push({
      email: 'recepcion@pacificreef.cl',
      name: 'Recepcionista Principal',
      role: 'recepcionista',
      password_hash: 'hash_de_contraseña_segura', // Debes generar el hash real
      created_at: new Date().toISOString(),
      telefono: '+56987654321',
      turno: 'mañana'
    });
    localStorage.setItem('users_db_v1', JSON.stringify(users));
  }
}