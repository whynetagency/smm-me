import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingCompletedGuard implements CanActivate {

  constructor(private router: Router, private storageService: StorageService) { }

  canActivate() {
    if(this.storageService.get('onboardingCompleted') === 'true'){
      this.router.navigateByUrl('/login').then();
      return false;
    } else {
      return true;
    }
  }
}
