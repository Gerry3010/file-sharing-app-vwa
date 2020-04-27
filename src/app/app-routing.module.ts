import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { FileRequestsComponent } from './components/file-requests/file-requests.component';
import { FileRequestDetailComponent } from './components/file-request-detail/file-request-detail.component';

const routes: Routes = [
  { path: '', component: FileRequestsComponent },
  { path: 'file-requests/:id', component: FileRequestDetailComponent },
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
