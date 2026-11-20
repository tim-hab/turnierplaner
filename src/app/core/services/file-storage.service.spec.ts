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

  it('can cancel browser import when no file API is available', async () => {
    window.electron = undefined;

    const result = await service.openJsonFile();

    expect(result.canceled).toBe(true);
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

  it('reports unsupported browser export when download APIs are unavailable', async () => {
    window.electron = undefined;

    const result = await service.saveJsonFile('{}');

    expect(result.canceled).toBe(false);
    expect(result.error).toBeDefined();
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
