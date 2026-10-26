import { TestBed } from '@angular/core/testing';

import { FileStorageService } from './file-storage.service';

describe('FileStorageService', () => {
  let service: FileStorageService;
  const originalElectron = window.electron;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileStorageService);
  });

  afterEach(() => {
    window.electron = originalElectron;
  });

  it('returns an error when electron api is unavailable for import', async () => {
    window.electron = undefined;

    const result = await service.openJsonFile();

    expect(result).toEqual({
      canceled: false,
      error: 'Dateiimport ist nur in der Desktop-App verfügbar.',
    });
  });

  it('delegates import to electron api', async () => {
    const openJsonFile = vi.fn().mockResolvedValue({ canceled: false, content: '{}' });
    window.electron = {
      isAvailable: true,
      openJsonFile,
      saveJsonFile: vi.fn(),
    };

    const result = await service.openJsonFile();

    expect(openJsonFile).toHaveBeenCalled();
    expect(result.content).toBe('{}');
  });

  it('returns an error when electron api is unavailable for export', async () => {
    window.electron = undefined;

    const result = await service.saveJsonFile('{}');

    expect(result).toEqual({
      canceled: false,
      error: 'Dateiexport ist nur in der Desktop-App verfügbar.',
    });
  });

  it('delegates export to electron api', async () => {
    const saveJsonFile = vi.fn().mockResolvedValue({ canceled: false });
    window.electron = {
      isAvailable: true,
      openJsonFile: vi.fn(),
      saveJsonFile,
    };

    await service.saveJsonFile('{"test":true}');

    expect(saveJsonFile).toHaveBeenCalledWith('{"test":true}');
  });
});
