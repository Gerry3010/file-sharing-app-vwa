import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { FileRequestsComponent } from './file-requests/file-requests.component';

const routes: Routes = [
  { path: '', component: FileRequestsComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    StoreRouterConnectingModule.forRoot(),
  ],
  exports: [ RouterModule ],
})
export class AppRoutingModule {
}
