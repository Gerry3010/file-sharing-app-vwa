import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFileRequestDialogComponent } from './create-file-request-dialog.component';
import { Store, StoreModule } from '@ngrx/store';

describe('CreateFileRequestDialogComponent', () => {
  let component: CreateFileRequestDialogComponent;
  let fixture: ComponentFixture<CreateFileRequestDialogComponent>;
  let store: Store<any>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      imports: [ StoreModule.forRoot({}) ],
      declarations: [ CreateFileRequestDialogComponent ]
    });

    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFileRequestDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.get<Store>(Store);

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
