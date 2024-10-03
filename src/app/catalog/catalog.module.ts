import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {CatalogPageRoutingModule} from './catalog-routing.module';
import {CatalogPage} from './catalog.page';
import {CatalogItemPage} from './catalog-item/catalog-item.page';
import {CatalogSearchPage} from './catalog-search/catalog-search.page';
import {ColorPickerModule} from "ngx-color-picker";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CatalogPageRoutingModule,
        ColorPickerModule,
        FontAwesomeModule
    ],
  declarations: [CatalogPage, CatalogItemPage, CatalogSearchPage]
})
export class CatalogPageModule {
}
