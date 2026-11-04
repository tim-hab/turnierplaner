import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { TournamentRepository } from './core/repositories/tournament-repository';
import { SqliteTournamentRepository } from './core/repositories/sqlite-tournament-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    { provide: TournamentRepository, useClass: SqliteTournamentRepository },
  ],
};
