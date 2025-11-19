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
import { TablaComponent } from './menu-jugar/tabla-component/tabla-component';
import { MenuSimulacion } from './menu-jugar/menu-simulacion/menu-simulacion';
import { SimularPartido } from './menu-jugar/menu-simulacion/simular-partido/simular-partido';
import { SimularPartidoRapido } from './menu-jugar/menu-simulacion/simular-partido-rapido/simular-partido-rapido';
import { EstadisticasEquipo } from './menu-jugar/estadisticas-equipo/estadisticas-equipo';
import { EstadisticasTorneo } from './menu-jugar/estadisticas-torneo/estadisticas-torneo';
import { Dt } from './dt/dt';

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
    path: 'dt',
    canActivate: [AuthGuard],
    component: Dt,
  },
  {
    path: 'inicio/:id',
    canActivate: [AuthGuard],
    component: InicioComponent

  },
  {
    path: 'fixture/:id', 
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
  {
    path: 'tabla/:id',
    canActivate: [AuthGuard],
    component: TablaComponent
  },
  {
    path: 'menuSimulacion/:id',
    canActivate: [AuthGuard],
    component: MenuSimulacion
  },
  {
    path: 'simulacionPartido/:id',
    canActivate: [AuthGuard],
    component: SimularPartido
  },
  {
    path: 'simulacionPartidoRapido/:id',
    canActivate: [AuthGuard],
    component: SimularPartidoRapido
  },
  {
    path: 'estadisticasEquipo/:id',
    canActivate: [AuthGuard],
    component: EstadisticasEquipo
  },
  {
    path: 'estadisticasTorneo/:id',
    canActivate: [AuthGuard],
    component: EstadisticasTorneo
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];