import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar si la ruta requiere rol de ADMIN
  const requiresAdmin = route.data?.['requiresAdmin'] || false;
  
  if (requiresAdmin && !authService.isAdmin()) {
    router.navigate(['/home']); // Redirigir a home si no es admin
    return false;
  }

  return true;
};
