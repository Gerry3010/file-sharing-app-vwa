import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportFileRequestDialogComponent } from './import-file-request-dialog.component';

describe('ImportFileRequestDialogComponent', () => {
  let component: ImportFileRequestDialogComponent;
  let fixture: ComponentFixture<ImportFileRequestDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportFileRequestDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportFileRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
