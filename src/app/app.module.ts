import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
import { AppComponent } from './components/app/app.component';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { META_REDUCERS, MetaReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';

import { metaReducers, reducers, State } from './reducers';
import { effects } from './effects';

import { FileRequestsComponent } from './components/file-requests/file-requests.component';
import { FileRequestListComponent } from './components/file-request-list/file-request-list.component';
import { PersistenceService } from './services/persistence.service';
import { persistenceMetaReducer } from './reducers/persistence.metareducer';
import { FileRequestDetailComponent } from './components/file-request-detail/file-request-detail.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { NgBytesPipeModule, NgOrderByPipeModule } from 'angular-pipes';
import { registerLocaleData } from '@angular/common';
import localeDeAt from '@angular/common/locales/de-AT';
import { FileListComponent } from './components/file-list/file-list.component';
import { CreateFileRequestDialogComponent } from './components/create-file-request-dialog/create-file-request-dialog.component';
import { FormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ImportFileRequestDialogComponent } from './components/import-file-request-dialog/import-file-request-dialog.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

registerLocaleData(localeDeAt, 'de-AT');

export function getMetaReducers(persistenceService: PersistenceService): MetaReducer<State> {
  return persistenceMetaReducer(persistenceService);
}

@NgModule({
  declarations: [
    AppComponent,
    FileRequestsComponent,
    FileRequestListComponent,
    FileRequestDetailComponent,
    FileListComponent,
    CreateFileRequestDialogComponent,
    ConfirmationDialogComponent,
    ImportFileRequestDialogComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence({ synchronizeTabs: true }), // Configures persistence
    AngularFireStorageModule,
    StoreModule.forRoot(reducers, { metaReducers, runtimeChecks: {} }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    EffectsModule.forRoot(effects),
    MaterialModule,
    ZXingScannerModule,
    NgxQRCodeModule,
    NgxDropzoneModule,
    NgBytesPipeModule,
    NgOrderByPipeModule,
  ],
  providers: [
    {
      provide: META_REDUCERS,
      deps: [ PersistenceService ],
      useFactory: getMetaReducers,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'de-AT' },
  ],
  bootstrap: [ AppComponent ],
  entryComponents: [ CreateFileRequestDialogComponent, ImportFileRequestDialogComponent ],
})
export class AppModule {
}
