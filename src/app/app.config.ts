import { ApplicationConfig, Injectable, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { routes } from './app.routes';
import { TournamentRepository } from './core/repositories/tournament-repository';
import { SqliteTournamentRepository } from './core/repositories/sqlite-tournament-repository';

@Injectable()
class FileLocationStrategy extends HashLocationStrategy {
  override pushState(_state: unknown, _title: string, url: string): void {
    globalThis.location.hash = url.startsWith('#') ? url : `#${url}`;
  }

  override replaceState(_state: unknown, _title: string, url: string): void {
    globalThis.location.hash = url.startsWith('#') ? url : `#${url}`;
  }
}

const fileLocationProviders =
  globalThis.location?.protocol === 'file:'
    ? [{ provide: LocationStrategy, useClass: FileLocationStrategy }]
    : [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    ...fileLocationProviders,
    { provide: TournamentRepository, useClass: SqliteTournamentRepository },
  ],
};
