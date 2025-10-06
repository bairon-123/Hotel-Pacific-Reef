import { Routes } from '@angular/router';
import { adminGuard } from './pages/admin.guard';
import { recepcionistaGuard } from './pages/recepcionista.guard';
import { authGuard }  from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage) },

  // Usuario
  { path: 'home',        loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
  { path: 'reservas',    loadComponent: () => import('./reservas/reservas.page').then(m => m.ReservasPage), canActivate: [authGuard] },
  { path: 'portal-pago', loadComponent: () => import('./portal-pago/portal-pago.page').then(m => m.PortalPagoPage), canActivate: [authGuard] },
  { path: 'perfil',      loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage), canActivate: [authGuard] },

  // Recepcionista (ANTES del wildcard)
  { path: 'recepcionista', loadComponent: () => import('./pages/recepcionista/recepcionista.page').then(m => m.RecepcionistaPage), canActivate: [recepcionistaGuard] },
  { path: 'recepcionista/checkin', loadComponent: () => import('./pages/recepcionista-checkin/recepcionista-checkin.page').then(m => m.RecepcionistaCheckinPage), canActivate: [recepcionistaGuard] },
  { path: 'recepcionista/habitaciones', loadComponent: () => import('./pages/recepcionista-habitaciones/recepcionista-habitaciones.page').then(m => m.RecepcionistaHabitacionesPage), canActivate: [recepcionistaGuard] },
  { path: 'recepcionista/pagos', loadComponent: () => import('./pages/recepcionista-pagos/recepcionista-pagos.page').then(m => m.RecepcionistaPagosPage), canActivate: [recepcionistaGuard] },

  // Admin
  { path: 'admin',                loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage), canActivate: [adminGuard] },
  { path: 'admin/usuarios',       loadComponent: () => import('./pages/admin-usuarios/admin-usuarios.page').then(m => m.AdminUsuariosPage), canActivate: [adminGuard] },
  { path: 'admin/reservas',       loadComponent: () => import('./pages/admin-reservas/admin-reservas.page').then(m => m.AdminReservasPage), canActivate: [adminGuard] },
  { path: 'admin/habitaciones',   loadComponent: () => import('./pages/admin-habitaciones/admin-habitaciones.page').then(m => m.AdminHabitacionesPage), canActivate: [adminGuard] },
  { path: 'admin/reportes',       loadComponent: () => import('./pages/admin-reportes/admin-reportes.page').then(m => m.AdminReportesPage), canActivate: [adminGuard] },
  

  // WILDCARD al final
  { path: '**', redirectTo: 'home' },
];