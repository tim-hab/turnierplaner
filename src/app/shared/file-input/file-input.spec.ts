import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportJsonService } from '@core/services/export-json.service';

import { FileInput } from './file-input';

describe('FileInput', () => {
  let component: FileInput;
  let fixture: ComponentFixture<FileInput>;
  const exportJsonService = {
    importJsonFromFile: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [FileInput],
      providers: [{ provide: ExportJsonService, useValue: exportJsonService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FileInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('delegates import to export service', () => {
    component.importJsonFile();

    expect(exportJsonService.importJsonFromFile).toHaveBeenCalled();
  });
});
