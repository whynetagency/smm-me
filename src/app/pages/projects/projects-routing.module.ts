import { NgModule } from '@angular/core';
import {ProjectsPage} from './projects.page';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: '', component: ProjectsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsPageRoutingModule {}
