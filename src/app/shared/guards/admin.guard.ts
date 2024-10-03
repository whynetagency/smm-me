import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {AuthService} from '../../core/services/auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AdminGuard implements CanActivate {
  constructor(public authService: AuthService, public router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // @ts-ignore
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    if (!user.isAdmin || !this.authService.isLoggedIn) {
      this.router.navigate(['home']).then();
    }
    return true;
  }
}
