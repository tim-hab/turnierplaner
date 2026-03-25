import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportJsonDialog } from './import-json.dialog';

describe('ImportJsonDialog', () => {
  let component: ImportJsonDialog;
  let fixture: ComponentFixture<ImportJsonDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportJsonDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportJsonDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
