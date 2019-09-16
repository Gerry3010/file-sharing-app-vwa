import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';

import { metaReducers, reducers } from './reducers';
import { effects } from './effects';
import { FileRequestsComponent } from './file-requests/file-requests.component';
import { IncomingRequestsComponent } from './incoming-requests/incoming-requests.component';
import { CommonModule } from '@angular/common';
import { OutgoingRequestsComponent } from './outgoing-requests/outgoing-requests.component';

@NgModule({
  declarations: [
    AppComponent,
    FileRequestsComponent,
    IncomingRequestsComponent,
    OutgoingRequestsComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence({ synchronizeTabs: true }), // Configures persistence
    AngularFireStorageModule,
    StoreModule.forRoot(reducers, { metaReducers, runtimeChecks: {} }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    EffectsModule.forRoot(effects),
    MaterialModule,
  ],
  providers: [],
  bootstrap: [ AppComponent ],
})
export class AppModule {
}
