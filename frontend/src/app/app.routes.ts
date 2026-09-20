import { Routes } from '@angular/router';
import { AlumnosComponent } from './alumnos/alumnos.component';
import { AdministracionComponent } from './administracion/administracion.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'alumnos', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Iniciar sesión' },
  { path: 'alumnos', component: AlumnosComponent, title: 'Alumnos', canActivate: [authGuard] },
  { path: 'administracion', component: AdministracionComponent, title: 'Administración', canActivate: [authGuard] },
];