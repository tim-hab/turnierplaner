import { TestBed } from '@angular/core/testing';

import { ExportJsonService } from './export-json.service';

describe('ExportJsonService', () => {
  let service: ExportJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
