import {Component, NgZone, ViewChild} from '@angular/core';
import {AuthService} from './core/services/auth.service';
import {StorageService} from './core/services/storage.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {IonRouterOutlet, MenuController, ModalController} from '@ionic/angular';
import {PrivacyPolicyPage} from './pages/privacy-policy/privacy-policy.page';
import {TermsPage} from './pages/terms/terms.page';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  // @ts-ignore
  @ViewChild(IonRouterOutlet, { static : true }) routerOutlet: IonRouterOutlet;
  currentRoute = '';

  constructor(
    private menu: MenuController,
    public authService: AuthService,
    private storageService: StorageService,
    public router: Router,
    private modalCtrl: ModalController,
    public ngZone: NgZone
  ) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  get isAdmin(): boolean {
    return this.currentRoute === '/admin';
  }

  onLogout() {
    return this.authService.signOut().then(() => {
      localStorage.clear();
      sessionStorage.clear();
      this.storageService.clear();
      this.menu.close().then();
      this.ngZone.run(() => {
        this.router.navigate(['login']).then();
      });
    });
  }

  public async onOpenPrivacy() {
    this.menu.close().then();
    const modal = await this.modalCtrl.create({
      component: PrivacyPolicyPage,
      presentingElement: this.routerOutlet.nativeEl,
      swipeToClose: true
    });
    await modal.present();
    await modal.onWillDismiss().then(() => {
      this.menu.open().then();
    });
  }

  public async onOpenTerms() {
    this.menu.close().then();
    const modal = await this.modalCtrl.create({
      component: TermsPage,
      presentingElement: this.routerOutlet.nativeEl,
      swipeToClose: true
    });
    await modal.present();
    await modal.onWillDismiss().then(() => {
      this.menu.open().then();
    });
  }
}
