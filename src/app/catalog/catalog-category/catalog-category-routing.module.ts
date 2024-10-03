import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CatalogCategoryPage} from './catalog-category.page';

const routes: Routes = [
    { path: '', component: CatalogCategoryPage },
    { path: ':subCategory',
      loadChildren: () => import('../catalog-items-list/catalog-items-list.module').then(m => m.CatalogCategoryItemListPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CatalogCategoryPageRoutingModule {}
