import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CatalogItemsListPage} from './catalog-items-list.page';
import {CatalogItemPage} from '../catalog-item/catalog-item.page';

const routes: Routes = [
    { path: '', component: CatalogItemsListPage },
    { path: ':id',  component: CatalogItemPage }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CatalogItemsListRoutingModule {}
