import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingRequestsComponent } from './incoming-requests.component';
import { Store, StoreModule } from '@ngrx/store';
import { State } from '../reducers';

describe('IncomingRequestsComponent', () => {
  let component: IncomingRequestsComponent;
  let fixture: ComponentFixture<IncomingRequestsComponent>;
  let store: Store<any>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      imports: [ StoreModule.forRoot({}) ],
      declarations: [ IncomingRequestsComponent ]
    });

    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingRequestsComponent);
    component = fixture.componentInstance;
    store = TestBed.get<Store<State>>(Store);

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
