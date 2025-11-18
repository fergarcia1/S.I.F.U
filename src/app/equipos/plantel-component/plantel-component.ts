import { Component, computed, inject, linkedSignal, Signal } from '@angular/core';
import { TeamsService } from '../teams-service';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TeamsSelectionComponent } from '../teams-selection-component/teams-selection-component';
import { Teams } from '../../models/teams';

@Component({
  selector: 'app-plantel-component',
  imports: [],
  templateUrl: './plantel-component.html',
  styleUrl: './plantel-component.css',
})
export class PlantelComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly service = inject(TeamsService)
  private readonly teamId = Number(this.route.snapshot.paramMap.get('id') ?? 0.00);

  protected readonly teamSource: Signal<Teams | undefined> = toSignal(this.service.getTeamById(this.teamId))
  public readonly team = computed(() => this.teamSource());
  public readonly squad = computed(() => this.teamSource()?.squad ?? []);

  public readonly isLoading = computed(() => this.teamSource() === undefined);







}
