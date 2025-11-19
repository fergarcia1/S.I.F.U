import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service'; // Ajusta la ruta si es necesario

export const LoginGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si el usuario YA ESTÁ logueado...
  if (auth.isLogged()) {
    // ... lo mandamos directo al menú (o lista de equipos)
    router.navigate(['/menu']); 
    return false; // Bloqueamos el acceso al login
  }

  // Si NO está logueado, lo dejamos pasar al login
  return true;
};