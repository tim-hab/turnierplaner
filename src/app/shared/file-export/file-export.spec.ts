import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportJsonService } from '@core/services/export-json.service';

import { FileExport } from './file-export';

describe('FileExport', () => {
  let component: FileExport;
  let fixture: ComponentFixture<FileExport>;
  const exportJsonService = {
    exportJsonToFile: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [FileExport],
      providers: [{ provide: ExportJsonService, useValue: exportJsonService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FileExport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('delegates export to export service', () => {
    component.exportJsonFile();

    expect(exportJsonService.exportJsonToFile).toHaveBeenCalled();
  });
});
