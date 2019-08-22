import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRequestsComponent } from './file-requests.component';
import { Store, StoreModule } from '@ngrx/store';
import { MaterialModule } from '../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FileRequestsComponent', () => {
  let component: FileRequestsComponent;
  let fixture: ComponentFixture<FileRequestsComponent>;
  let store: Store<any>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, StoreModule.forRoot({}), MaterialModule ],
      declarations: [ FileRequestsComponent ],
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
