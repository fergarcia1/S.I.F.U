import { Routes } from '@angular/router';
import { TeamsSelectionComponent } from './equipos/teams-selection-component/teams-selection-component';
import { PlantelComponent } from './equipos/plantel-component/plantel-component'; 
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './guards/auth-guard';
import { RegisterComponent } from './auth/register/register.component';


export const routes: Routes = [
    {path: 'listaTeams', component: TeamsSelectionComponent},
    {path: 'listaTeams/:id', component: PlantelComponent},
    
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
   { path: 'register', component: RegisterComponent },
  {
    path: 'menu',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./menu-principal/menu-principal.component').then(m => m.MenuComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];