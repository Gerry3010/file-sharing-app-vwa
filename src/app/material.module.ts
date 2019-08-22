import { NgModule } from '@angular/core';
import { MatButtonModule, MatButtonToggleModule, MatIconModule, MatListModule, MatTabsModule, MatToolbarModule } from '@angular/material';

@NgModule({
  imports: [ MatButtonModule, MatButtonToggleModule, MatIconModule, MatListModule, MatTabsModule, MatToolbarModule ],
  exports: [ MatButtonModule, MatButtonToggleModule, MatIconModule, MatListModule, MatTabsModule, MatToolbarModule ],
})
export class MaterialModule {
}
