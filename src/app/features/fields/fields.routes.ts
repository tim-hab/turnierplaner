import { Routes } from '@angular/router';

export const FIELDS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./fields.page').then((module) => module.FieldsPage),
  },
];
