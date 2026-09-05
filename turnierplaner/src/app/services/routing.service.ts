import { Injectable, signal } from '@angular/core';
import { Route } from '../app.routes';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  activeRoute = signal<Route>(Route.Settings);
}
