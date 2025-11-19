import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';

export const PlayerGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.getUser();

  // Si es ADMIN, no tiene nada que hacer en el menú de jugadores
  if (user && user.role === 'admin') {
    router.navigate(['/menuAdmin']); // Lo mandamos a su sitio
    return false;
  }

  return true;
};