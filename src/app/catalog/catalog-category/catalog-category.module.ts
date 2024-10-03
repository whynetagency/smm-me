import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CatalogCategoryPageRoutingModule} from './catalog-category-routing.module';
import {CatalogCategoryPage} from './catalog-category.page';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        CatalogCategoryPageRoutingModule
    ],
    declarations: [CatalogCategoryPage]
})
export class CatalogCategoryPageModule {
}
