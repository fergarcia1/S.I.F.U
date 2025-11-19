import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();

  // 1. Si es ADMIN, tiene permiso total a esta ruta
  if (user && user.role === 'admin') {
    return true;
  }
  
  // 2. Si es un JUGADOR intentando entrar a admin, lo rebotamos a su menú
  if (user) {
    router.navigate(['/menu']);
  } else {
    // 3. Si no hay nadie, al login
    router.navigate(['/login']);
  }
  return false;
};