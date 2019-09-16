import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRequestsComponent } from './file-requests.component';
import { Store, StoreModule } from '@ngrx/store';
import { MaterialModule } from '../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IncomingRequestsComponent } from '../incoming-requests/incoming-requests.component';
import { OutgoingRequestsComponent } from '../outgoing-requests/outgoing-requests.component';

describe('FileRequestsComponent', () => {
  let component: FileRequestsComponent;
  let fixture: ComponentFixture<FileRequestsComponent>;
  let store: Store<any>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, StoreModule.forRoot({}), MaterialModule ],
      declarations: [ FileRequestsComponent, IncomingRequestsComponent, OutgoingRequestsComponent ],
    });

    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileRequestsComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
