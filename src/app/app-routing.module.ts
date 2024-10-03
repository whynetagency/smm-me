import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {OnboardingGuard} from './shared/guards/onboarding.guard';
import {AuthGuard} from './shared/guards/auth.guard';
import {LoginGuard} from './shared/guards/login.guard';
import {OnboardingCompletedGuard} from './shared/guards/onboarding-completed.guard';
import {AdminGuard} from './shared/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  },
  {
    path: 'catalog',
    canActivate: [AuthGuard],
    loadChildren: () => import('./catalog/catalog.module').then(m => m.CatalogPageModule)
  },
  {
    path: 'projects',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/projects/projects.module').then(m => m.ProjectsPageModule)
  },
  {
    path: 'onboarding',
    canActivate: [OnboardingCompletedGuard],
    loadChildren: () => import('./pages/onboarding/onboarding.module').then( m => m.OnboardingPageModule)
  },
  {
    path: 'login',
    canActivate: [OnboardingGuard, LoginGuard],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    canActivate: [LoginGuard],
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'verify',
    canActivate: [LoginGuard],
    loadChildren: () => import('./pages/verify/verify.module').then(m => m.VerifyPageModule)
  },
  {
    path: 'restore',
    canActivate: [LoginGuard],
    loadChildren: () => import('./pages/restore/restore.module').then(m => m.RestorePageModule)
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminPageModule)
  },
  {path: 'terms', loadChildren: () => import('./pages/terms/terms.module').then(m => m.TermsPageModule)},
  {path: 'terms', loadChildren: () => import('./pages/privacy-policy/privacy-policy.module').then(m => m.PrivacyPageModule)},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
