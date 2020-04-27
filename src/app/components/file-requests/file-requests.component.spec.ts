import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRequestsComponent } from './file-requests.component';
import { Store, StoreModule } from '@ngrx/store';
import { MaterialModule } from '../../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FileRequestListComponent } from '../file-request-list/file-request-list.component';
import { reducers, State } from '../../reducers';

describe('FileRequestsComponent', () => {
  let component: FileRequestsComponent;
  let fixture: ComponentFixture<FileRequestsComponent>;
  let store: Store<State>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, StoreModule.forRoot(reducers), MaterialModule ],
      declarations: [ FileRequestsComponent, FileRequestListComponent ],
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
