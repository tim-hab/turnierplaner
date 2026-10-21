import { TestBed } from '@angular/core/testing';

import { RoutingService } from './routing.service';

describe('RoutingService', () => {
  let service: RoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoutingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts on the settings route and allows route changes', () => {
    expect(service.activeRoute()).toBe(1);

    service.activeRoute.set(2);

    expect(service.activeRoute()).toBe(2);
  });
});
