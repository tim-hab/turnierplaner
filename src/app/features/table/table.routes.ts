import { Routes } from '@angular/router';

export const TABLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./table.page').then((module) => module.TablePage),
  },
];
