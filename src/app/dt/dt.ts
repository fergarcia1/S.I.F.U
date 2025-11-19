import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DtService } from './dt-service';
import { DtProfile } from '../models/dt-profile';
import { MenuComponent } from '../menu-principal/menu-principal.component';
import { AuthService } from '../auth/auth-service';

@Component({
  selector: 'app-dt',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dt.html',
  styleUrl: './dt.css',
})
export class Dt {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dtService = inject(DtService);
  private readonly auth = inject(AuthService);

  isSaving = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    nationality: ['', Validators.required],
    age: [25, [Validators.required, Validators.min(18)]],
    playStyle: ['Balanced'],
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const values = this.form.getRawValue();

    const profile: DtProfile = {
      id: Date.now(),
      userId: this.auth.getUser()!.id,
      name: values.name,
      nationality: values.nationality,
      age: values.age,
      playStyle: values.playStyle,
    };

    this.dtService.saveProfile(profile).subscribe({
      next: (saved) => {
        this.dtService.profile.set(saved);
        this.isSaving.set(false);
        this.router.navigate(['/listaTeams']);
      },
      error: (err) => {
        console.error('Error guardando manager', err);
        this.isSaving.set(false);
        alert('Error guardando el perfil del DT');
      },
    });
  }
}
