import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRequestDetailComponent } from './file-request-detail.component';
import { Store, StoreModule } from '@ngrx/store';

describe('FileRequestDetailComponent', () => {
  let component: FileRequestDetailComponent;
  let fixture: ComponentFixture<FileRequestDetailComponent>;
  let store: Store<any>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      imports: [ StoreModule.forRoot({}) ],
      declarations: [ FileRequestDetailComponent ]
    });

    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileRequestDetailComponent);
    component = fixture.componentInstance;
    store = TestBed.get<Store>(Store);

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
