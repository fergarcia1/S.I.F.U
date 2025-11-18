import { Routes } from '@angular/router';
import { TeamsSelectionComponent } from './equipos/teams-selection-component/teams-selection-component';
import { PlantelComponent } from './equipos/plantel-component/plantel-component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './guards/auth-guard';
import { RegisterComponent } from './auth/register/register.component';
import { InicioComponent } from './menu-jugar/inicio-component/inicio-component';
import { MenuComponent } from './menu-principal/menu-principal.component';
import { FixtureComponent } from './menu-jugar/fixture-component/fixture-component';
import { PlantillaComponent } from './menu-jugar/plantilla-component/plantilla-component';
import { FormAgregarJugdaor } from './admin/form-agregar-jugdaor/form-agregar-jugdaor';
import { MenuAdmin } from './admin/menu-admin/menu-admin';


export const routes: Routes = [
  {
    path: 'listaTeams',
    canActivate: [AuthGuard],
    component: TeamsSelectionComponent
  },
  {
    path: 'listaTeams/:id',
    canActivate: [AuthGuard],
    component: PlantelComponent
  },

  {
    path: 'login',
    component: LoginComponent
  },
  { path: 'register', component: RegisterComponent },
  {
    path: 'menu',
    canActivate: [AuthGuard],
    component: MenuComponent
  },
  {
    path: 'inicio/:id',
    canActivate: [AuthGuard],
    component: InicioComponent

  },
  {
    path: 'fixture',
    canActivate: [AuthGuard],
    component: FixtureComponent
  },
  {
    path: 'plantilla/:id',
    canActivate: [AuthGuard],
    component: PlantillaComponent
  },
  {path: 'menuAdmin',component: MenuAdmin},
  {path: 'formAgregarJugador',component: FormAgregarJugdaor},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];