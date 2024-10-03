import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CatalogItemsListPage} from './catalog-items-list.page';
import {CatalogItemsListRoutingModule} from './catalog-items-list-routing.module';
import {StarRatingModule} from "angular-star-rating";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        CatalogItemsListRoutingModule,
        StarRatingModule
    ],
  declarations: [CatalogItemsListPage]
})
export class CatalogCategoryItemListPageModule {
}
