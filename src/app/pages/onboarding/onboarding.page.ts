import { Component, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { StorageService } from '../../core/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage {
  @ViewChild(IonSlides) slides: IonSlides;
  sliderLength = 4;
  activeSlide = 1;

  constructor(
    private storageService: StorageService,
    private router: Router
  ) { }

  prev() {
    this.slides.slidePrev().then();
  }
  next() {
    this.slides.slideNext().then();
  }
  getStarted() {
    this.storageService.set('onboardingCompleted', 'true');
    this.router.navigateByUrl('/login').then();
  }
  onPrev() {
    this.activeSlide--;
  }
  onNext() {
    this.activeSlide++;
  }
}
