import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'settings',
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.routes').then(
        (module) => module.SETTINGS_ROUTES,
      ),
  },
  {
    path: 'fields',
    loadChildren: () =>
      import('./features/fields/fields.routes').then(
        (module) => module.FIELDS_ROUTES,
      ),
  },
  {
    path: 'table',
    loadChildren: () =>
      import('./features/table/table.routes').then(
        (module) => module.TABLE_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: 'settings',
  },
];
