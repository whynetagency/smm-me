import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {ProjectsPage} from './projects.page';
import {RouterModule, Routes} from '@angular/router';
import {ProjectsPageRoutingModule} from './projects-routing.module';

const routes: Routes = [
  {
    path: '',
    component: ProjectsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    ProjectsPageRoutingModule
  ],
  declarations: [ProjectsPage]
})
export class ProjectsPageModule {
}
