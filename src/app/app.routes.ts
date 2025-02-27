import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CarManagementComponent } from './components/car-management/car-management.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';

export const routes: Route[] = [
  { path: '', redirectTo: 'cars', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cars', component: CarManagementComponent, canActivate: [authGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: 'cars' }
];
