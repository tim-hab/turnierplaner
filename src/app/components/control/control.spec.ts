import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Control } from './control';
import { Route } from '../../app.routes';

describe('Control', () => {
  let component: Control;
  let fixture: ComponentFixture<Control>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Control],
    }).compileComponents();

    fixture = TestBed.createComponent(Control);
    fixture.componentRef.setInput('activeRoute', Route.Settings);
    fixture.detectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
