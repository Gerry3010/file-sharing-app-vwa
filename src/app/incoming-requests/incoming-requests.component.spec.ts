import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingRequestsComponent } from './incoming-requests.component';
import { Store, StoreModule } from '@ngrx/store';
import { State } from '../reducers';
import { MaterialModule } from '../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('IncomingRequestsComponent', () => {
  let component: IncomingRequestsComponent;
  let fixture: ComponentFixture<IncomingRequestsComponent>;
  let store: Store<any>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, StoreModule.forRoot({}), MaterialModule ],
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
