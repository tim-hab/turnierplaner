import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExportJsonService } from '@core/services/export-json.service';

import { ImportJsonDialog } from './import-json.dialog';

describe('ImportJsonDialog', () => {
  let component: ImportJsonDialog;
  let fixture: ComponentFixture<ImportJsonDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportJsonDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: '{"player":[],"clubs":[]}' },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: ExportJsonService, useValue: { importPlayerData: vi.fn(), importJsonString: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportJsonDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('imports only players and closes the dialog', () => {
    const service = TestBed.inject(ExportJsonService);
    const dialogRef = TestBed.inject(MatDialogRef);

    component.onlyPlayers();

    expect(service.importPlayerData).toHaveBeenCalledWith(component.content);
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('imports all data and closes the dialog', () => {
    const service = TestBed.inject(ExportJsonService);
    const dialogRef = TestBed.inject(MatDialogRef);

    component.allData();

    expect(service.importJsonString).toHaveBeenCalledWith(component.content);
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
