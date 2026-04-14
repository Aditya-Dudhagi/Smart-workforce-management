import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = (route.data['roles'] as string[]) || [];
    const isAuthorized = expectedRoles.length === 0 || expectedRoles.some((role) => this.authService.hasRole(role));

    if (isAuthorized) {
      return true;
    }

    this.router.navigate(['/auth/unauthorized']);
    return false;
  }
}
