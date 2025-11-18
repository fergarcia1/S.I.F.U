import { Routes } from '@angular/router';
import { TeamsSelectionComponent } from './equipos/teams-selection-component/teams-selection-component';
import { PlantelComponent } from './equipos/plantel-component/plantel-component'; 

export const routes: Routes = [
    {path: 'listaTeams', component: TeamsSelectionComponent},
    {path: 'listaTeams/:id', component: PlantelComponent},
    {path: '**', component: TeamsSelectionComponent}
];
