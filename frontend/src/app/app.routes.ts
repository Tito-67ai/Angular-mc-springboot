import { Routes } from '@angular/router';
import { AlumnosComponent } from './alumnos/alumnos.component';
import { AdministracionComponent } from './administracion/administracion.component';

export const routes: Routes = [
  { path: '', redirectTo: 'alumnos', pathMatch: 'full' },
  { path: 'alumnos', component: AlumnosComponent, title: 'Alumnos' },
  { path: 'administracion', component: AdministracionComponent, title: 'Administración' },
];