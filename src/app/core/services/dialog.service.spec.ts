import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: { open: vi.fn() } }],
    });
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('opens the import dialog with the provided content', () => {
    const dialog = TestBed.inject(MatDialog);

    service.openImportDialog('json content');

    expect(dialog.open).toHaveBeenCalledWith(expect.anything(), { data: 'json content' });
  });

  it('opens the message dialog with message and optional accept text', () => {
    const dialog = TestBed.inject(MatDialog);

    service.openMessageDialog('Message', 'Accept');

    expect(dialog.open).toHaveBeenCalledWith(expect.anything(), {
      data: { message: 'Message', acceptText: 'Accept' },
    });
  });
});
