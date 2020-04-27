import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRequestListComponent } from './file-request-list.component';
import { Store, StoreModule } from '@ngrx/store';
import { reducers, State } from '../../reducers';
import { MaterialModule } from '../../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FileRequestListComponent', () => {
  let component: FileRequestListComponent;
  let fixture: ComponentFixture<FileRequestListComponent>;
  let store: Store<State>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, StoreModule.forRoot(reducers), MaterialModule ],
      declarations: [ FileRequestListComponent ]
    });

    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileRequestListComponent);
    component = fixture.componentInstance;
    store = TestBed.get<Store<State>>(Store);

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
