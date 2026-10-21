import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveTable } from './live-table';

describe('LiveTable', () => {
  let component: LiveTable;
  let fixture: ComponentFixture<LiveTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveTable],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
