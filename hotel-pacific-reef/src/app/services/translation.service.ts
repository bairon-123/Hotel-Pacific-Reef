import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const TRANSLATIONS: Translations = {
  es: {
    // Header
    'header.home': 'Home',
    'header.reservas': 'Reservas',
    'header.perfil': 'Perfil',
    'header.logout': 'Cerrar sesión',
    'header.hello': 'Hola,',
    
    // Home Page
    'home.welcome': 'Bienvenido al Paraíso',
    'home.subtitle': 'Frente al mar, con estilo y comodidad. Vive una experiencia inolvidable en la costa del Pacífico.',
    'home.bookNow': 'Reservar ahora',
    'home.services': 'Servicios Exclusivos',
    'home.luxuryRooms': 'Habitaciones de lujo',
    'home.luxuryRooms.subtitle': 'Vista mar • Premium',
    'home.luxuryRooms.content': 'Descanso superior con ropa de 500 hilos y amenities eco-friendly.',
    'home.gastronomy': 'Gastronomía internacional',
    'home.gastronomy.subtitle': 'Chef residente',
    'home.gastronomy.content': 'Sabores locales y de autor con productos frescos del día.',
    'home.spa': 'Spa & Wellness',
    'home.spa.subtitle': 'Relajo total',
    'home.spa.content': 'Circuito de aguas, masajes y sauna para renovar energías.',
    'home.about': 'Sobre nosotros',
    'home.about.content': 'Pacific Reef combina hospitalidad cálida con un diseño moderno junto al océano. Nuestro equipo está enfocado en cada detalle para que tu estadía sea perfecta.',
    'home.about.bullet1': 'Check-in express con QR',
    'home.about.bullet2': 'Wi-Fi de alta velocidad',
    'home.about.bullet3': 'Traslados y tours personalizados',
    'home.contact': 'Contáctanos',
    'home.contact.subtitle': 'Estamos para ti 24/7',
    'home.contact.address': '📍 Av. Costanera 123, Viña del Mar',
    'home.contact.phone': '📞 +56 9 1234 5678',
    'home.contact.message': 'Enviar mensaje',
    'home.footer': '© 2025 Hotel Pacific Reef — Todos los derechos reservados',

    // Reservas Page
    'reservas.search': 'Buscar disponibilidad',
    'reservas.minStay': 'Mínimo 5 días de anticipación',
    'reservas.arrival': 'Llegada',
    'reservas.departure': 'Salida',
    'reservas.checkin': 'Check-in desde',
    'reservas.checkout': 'Check-out hasta',
    'reservas.nights': 'noches',
    'reservas.roomType': 'Tipo de habitación',
    'reservas.all': 'Todas',
    'reservas.basic': 'Básica',
    'reservas.medium': 'Medium',
    'reservas.premium': 'Premium',
    'reservas.onlyAvailable': 'Solo disponibles',
    'reservas.stay': 'Estadía',
    'reservas.book': 'Reservar',
    'reservas.available': 'Disponible',
    'reservas.notAvailable': 'No disponible',
    'reservas.perNight': '/noche',

    // Perfil Page
    'perfil.title': 'Mi perfil',
    'perfil.subtitle': 'Datos de tu cuenta',
    'perfil.email': 'Correo',
    'perfil.language': 'Idioma preferido',
    'perfil.reservas': 'Mis reservas',
    'perfil.reservas.subtitle': 'Guardadas en este dispositivo',
    'perfil.noReservas': 'Aún no tienes reservas. Ve a',
    'perfil.reservasLink': 'Reservas',
    'perfil.toCreate': 'para crear una.',
    'perfil.edit': 'Editar',
    'perfil.delete': 'Eliminar',
    'perfil.editDates': 'Editar fechas',
    'perfil.newArrival': 'Nueva llegada',
    'perfil.newDeparture': 'Nueva salida',
    'perfil.saveChanges': 'Guardar cambios',

    // Portal Pago
    'pago.title': 'Confirmación de Reserva',
    'pago.subtitle': 'Complete sus datos de contacto y pago',
    'pago.summary': 'Resumen de su reserva',
    'pago.checkin': 'Check-in',
    'pago.checkout': 'Check-out',
    'pago.nights': 'Noches',
    'pago.pricePerNight': 'Precio por noche',
    'pago.totalStay': 'Total estadía',
    'pago.contactInfo': 'Información de contacto',
    'pago.fullName': 'Nombre completo *',
    'pago.email': 'Email *',
    'pago.phone': 'Teléfono *',
    'pago.paymentOptions': 'Opciones de pago',
    'pago.fullPayment': 'Pago completo (100%)',
    'pago.partialPayment': 'Pago inicial (30%) - Restante al check-in',
    'pago.amountToPay': 'Monto a pagar',
    'pago.paymentMethod': 'Método de pago',
    'pago.transfer': 'Transferencia',
    'pago.card': 'Tarjeta',
    'pago.bankDetails': 'Banco de Chile',
    'pago.account': 'Cuenta Corriente: 1234567890',
    'pago.rut': 'RUT: 11.345.688-9',
    'pago.transferEmail': 'Email: transferencias@pacificreef.cl',
    'pago.receipt': 'Número de comprobante *',
    'pago.cardNumber': 'Número de tarjeta *',
    'pago.cardName': 'Nombre en tarjeta *',
    'pago.cardExpiry': 'Fecha expiración *',
    'pago.cardCVV': 'CVV *',
    'pago.confirm': 'Confirmar y Pagar',
    'pago.confirmNote': '* Al confirmar, recibirá un correo electrónico con los detalles de su reserva.',

    // Login
    'login.title': 'Inicia sesión',
    'login.email': 'correo@ejemplo.com',
    'login.password': 'Contraseña',
    'login.enter': 'INGRESAR',
    'login.register': 'Crear cuenta',
    'login.forgot': '¿Olvidaste tu contraseña?',
    'login.registerTitle': 'Crear cuenta',
    'login.close': 'Cerrar',
    'login.passwordRepeat': 'Repetir contraseña',
    'login.createAccount': 'Crear cuenta',
  },
  en: {
    // Header
    'header.home': 'Home',
    'header.reservas': 'Bookings',
    'header.perfil': 'Profile',
    'header.logout': 'Log out',
    'header.hello': 'Hello,',
    
    // Home Page
    'home.welcome': 'Welcome to Paradise',
    'home.subtitle': 'Facing the sea, with style and comfort. Live an unforgettable experience on the Pacific coast.',
    'home.bookNow': 'Book now',
    'home.services': 'Exclusive Services',
    'home.luxuryRooms': 'Luxury Rooms',
    'home.luxuryRooms.subtitle': 'Sea View • Premium',
    'home.luxuryRooms.content': 'Superior rest with 500 thread count linens and eco-friendly amenities.',
    'home.gastronomy': 'International Gastronomy',
    'home.gastronomy.subtitle': 'Resident Chef',
    'home.gastronomy.content': 'Local and author flavors with fresh products of the day.',
    'home.spa': 'Spa & Wellness',
    'home.spa.subtitle': 'Total Relaxation',
    'home.spa.content': 'Water circuit, massages and sauna to renew energy.',
    'home.about': 'About us',
    'home.about.content': 'Pacific Reef combines warm hospitality with modern design by the ocean. Our team is focused on every detail to make your stay perfect.',
    'home.about.bullet1': 'Express check-in with QR',
    'home.about.bullet2': 'High speed Wi-Fi',
    'home.about.bullet3': 'Transfers and personalized tours',
    'home.contact': 'Contact us',
    'home.contact.subtitle': 'We are here for you 24/7',
    'home.contact.address': '📍 Av. Costanera 123, Viña del Mar',
    'home.contact.phone': '📞 +56 9 1234 5678',
    'home.contact.message': 'Send message',
    'home.footer': '© 2025 Hotel Pacific Reef — All rights reserved',

    // Reservas Page
    'reservas.search': 'Search availability',
    'reservas.minStay': 'Minimum 5 days in advance',
    'reservas.arrival': 'Arrival',
    'reservas.departure': 'Departure',
    'reservas.checkin': 'Check-in from',
    'reservas.checkout': 'Check-out until',
    'reservas.nights': 'nights',
    'reservas.roomType': 'Room type',
    'reservas.all': 'All',
    'reservas.basic': 'Basic',
    'reservas.medium': 'Medium',
    'reservas.premium': 'Premium',
    'reservas.onlyAvailable': 'Only available',
    'reservas.stay': 'Stay',
    'reservas.book': 'Book',
    'reservas.available': 'Available',
    'reservas.notAvailable': 'Not available',
    'reservas.perNight': '/night',

    // Perfil Page
    'perfil.title': 'My Profile',
    'perfil.subtitle': 'Your account data',
    'perfil.email': 'Email',
    'perfil.language': 'Preferred language',
    'perfil.reservas': 'My bookings',
    'perfil.reservas.subtitle': 'Saved on this device',
    'perfil.noReservas': 'You don\'t have bookings yet. Go to',
    'perfil.reservasLink': 'Bookings',
    'perfil.toCreate': 'to create one.',
    'perfil.edit': 'Edit',
    'perfil.delete': 'Delete',
    'perfil.editDates': 'Edit dates',
    'perfil.newArrival': 'New arrival',
    'perfil.newDeparture': 'New departure',
    'perfil.saveChanges': 'Save changes',

    // Portal Pago
    'pago.title': 'Reservation Confirmation',
    'pago.subtitle': 'Complete your contact and payment information',
    'pago.summary': 'Reservation summary',
    'pago.checkin': 'Check-in',
    'pago.checkout': 'Check-out',
    'pago.nights': 'Nights',
    'pago.pricePerNight': 'Price per night',
    'pago.totalStay': 'Total stay',
    'pago.contactInfo': 'Contact information',
    'pago.fullName': 'Full name *',
    'pago.email': 'Email *',
    'pago.phone': 'Phone *',
    'pago.paymentOptions': 'Payment options',
    'pago.fullPayment': 'Full payment (100%)',
    'pago.partialPayment': 'Initial payment (30%) - Remaining at check-in',
    'pago.amountToPay': 'Amount to pay',
    'pago.paymentMethod': 'Payment method',
    'pago.transfer': 'Transfer',
    'pago.card': 'Card',
    'pago.bankDetails': 'Banco de Chile',
    'pago.account': 'Current Account: 1234567890',
    'pago.rut': 'RUT: 11.345.688-9',
    'pago.transferEmail': 'Email: transferencias@pacificreef.cl',
    'pago.receipt': 'Receipt number *',
    'pago.cardNumber': 'Card number *',
    'pago.cardName': 'Name on card *',
    'pago.cardExpiry': 'Expiry date *',
    'pago.cardCVV': 'CVV *',
    'pago.confirm': 'Confirm and Pay',
    'pago.confirmNote': '* By confirming, you will receive an email with the details of your reservation.',

    // Login
    'login.title': 'Log in',
    'login.email': 'email@example.com',
    'login.password': 'Password',
    'login.enter': 'LOG IN',
    'login.register': 'Create account',
    'login.forgot': 'Forgot your password?',
    'login.registerTitle': 'Create account',
    'login.close': 'Close',
    'login.passwordRepeat': 'Repeat password',
    'login.createAccount': 'Create account',
  }
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = new BehaviorSubject<string>('es');
  public currentLang$ = this.currentLang.asObservable();

  constructor() {
    // Cargar idioma guardado
    const savedLang = localStorage.getItem('language') || 'es';
    this.currentLang.next(savedLang);
  }

  setLanguage(lang: string) {
    this.currentLang.next(lang);
    localStorage.setItem('language', lang);
  }

  getTranslation(key: string): string {
    const lang = this.currentLang.value;
    return TRANSLATIONS[lang]?.[key] || key;
  }

  getCurrentLang(): string {
    return this.currentLang.value;
  }
}