import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service'; // Ajusta la ruta si es necesario

export const LoginGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLogged()) {
    router.navigate(['/menu']); 
    return false; 
  }
  return true;
};