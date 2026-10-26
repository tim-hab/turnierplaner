import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player.service';
import { TournamentService } from './tournament.service';
import { DialogService } from './dialog.service';
import { FileStorageService } from './file-storage.service';

import { ExportJsonService } from './export-json.service';

describe('ExportJsonService', () => {
  let service: ExportJsonService;
  const dialogService = {
    openImportDialog: vi.fn(),
    openMessageDialog: vi.fn(),
  };
  const fileStorageService = {
    openJsonFile: vi.fn(),
    saveJsonFile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: DialogService, useValue: dialogService },
        { provide: FileStorageService, useValue: fileStorageService },
      ],
    });
    service = TestBed.inject(ExportJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('generates JSON containing player and tournament state', () => {
    TestBed.inject(PlayerService).addNewPlayer('Alice', 'Club', 600);

    const content = JSON.parse(service.generateJsonString());

    expect(content).toMatchObject({
      version: 'v1.0.0',
      player: [expect.objectContaining({ name: 'Alice' })],
      clubs: [],
      matches: [],
      history: [],
      round: 0,
      totalRounds: 5,
      running: true,
    });
  });

  it('imports player data and resets match statistics', () => {
    const input = JSON.stringify({
      player: [
        {
          id: 4,
          name: 'Alice',
          club: 'Club',
          elo: 600,
          wins: 3,
          losses: 2,
          frees: 1,
          played: 5,
          points: 80,
          active: true,
        },
      ],
      clubs: ['Club'],
      totalRounds: 6,
    });

    service.importPlayerData(input);

    expect(TestBed.inject(PlayerService).player()[0]).toMatchObject({
      id: 4,
      wins: 0,
      losses: 0,
      frees: 0,
      played: 0,
      points: 0,
    });
    expect(TestBed.inject(TournamentService).totalRounds()).toBe(6);
  });

  it('imports a valid exported tournament', () => {
    const input = JSON.stringify({
      version: 'v1.0.0',
      player: [],
      clubs: [],
      matches: [],
      history: [],
      round: 2,
      totalRounds: 5,
      running: false,
    });

    service.importJsonString(input);

    expect(TestBed.inject(TournamentService).round()).toBe(2);
    expect(TestBed.inject(TournamentService).running()).toBe(false);
  });

  it('reports invalid JSON through the dialog service', () => {
    service.importJsonString('{invalid');

    expect(dialogService.openMessageDialog).toHaveBeenCalled();
  });

  it('opens import dialog after successful file import', async () => {
    fileStorageService.openJsonFile.mockResolvedValue({ canceled: false, content: '{"player":[],"clubs":[]}' });

    await service.importJsonFromFile();

    expect(dialogService.openImportDialog).toHaveBeenCalledWith('{"player":[],"clubs":[]}');
  });

  it('does not show an error when file import is canceled', async () => {
    fileStorageService.openJsonFile.mockResolvedValue({ canceled: true });

    await service.importJsonFromFile();

    expect(dialogService.openMessageDialog).not.toHaveBeenCalled();
    expect(dialogService.openImportDialog).not.toHaveBeenCalled();
  });

  it('shows an error when file import fails', async () => {
    fileStorageService.openJsonFile.mockResolvedValue({
      canceled: false,
      error: 'Die ausgewählte Datei konnte nicht gelesen werden.',
    });

    await service.importJsonFromFile();

    expect(dialogService.openMessageDialog).toHaveBeenCalledWith(
      'Die ausgewählte Datei konnte nicht gelesen werden.',
    );
  });

  it('writes export content through file storage', async () => {
    fileStorageService.saveJsonFile.mockResolvedValue({ canceled: false });

    await service.exportJsonToFile();

    expect(fileStorageService.saveJsonFile).toHaveBeenCalledWith(service.generateJsonString());
  });

  it('shows an error when file export fails', async () => {
    fileStorageService.saveJsonFile.mockResolvedValue({
      canceled: false,
      error: 'Die Datei konnte nicht gespeichert werden.',
    });

    await service.exportJsonToFile();

    expect(dialogService.openMessageDialog).toHaveBeenCalledWith('Die Datei konnte nicht gespeichert werden.');
  });

  it('does not show an error when file export is canceled', async () => {
    fileStorageService.saveJsonFile.mockResolvedValue({ canceled: true });

    await service.exportJsonToFile();

    expect(dialogService.openMessageDialog).not.toHaveBeenCalled();
  });
});
