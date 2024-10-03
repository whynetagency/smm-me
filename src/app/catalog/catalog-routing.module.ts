import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatalogPage } from './catalog.page';

const routes: Routes = [
  { path: '', component: CatalogPage },
  {
    path: ':category',
    loadChildren: () => import('./catalog-category/catalog-category.module').then(m => m.CatalogCategoryPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogPageRoutingModule {}
