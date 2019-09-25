import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatListModule,
  MatSnackBarModule,
  MatTabsModule,
  MatToolbarModule,
} from '@angular/material';

@NgModule({
  imports: [ MatButtonModule, MatButtonToggleModule, MatIconModule, MatListModule, MatTabsModule, MatToolbarModule, MatSnackBarModule ],
  exports: [ MatButtonModule, MatButtonToggleModule, MatIconModule, MatListModule, MatTabsModule, MatToolbarModule, MatSnackBarModule ],
})
export class MaterialModule {
}
