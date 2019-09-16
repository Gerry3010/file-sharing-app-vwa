import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingRequestsComponent } from './outgoing-requests.component';
import { Store, StoreModule } from '@ngrx/store';
import { State } from '../reducers';
import { MaterialModule } from '../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('OutgoingRequestsComponent', () => {
  let component: OutgoingRequestsComponent;
  let fixture: ComponentFixture<OutgoingRequestsComponent>;
  let store: Store<any>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, StoreModule.forRoot({}), MaterialModule ],
      declarations: [ OutgoingRequestsComponent ]
    });

    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutgoingRequestsComponent);
    component = fixture.componentInstance;
    store = TestBed.get<Store<State>>(Store);

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
