import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlayerCard } from './add-player-card';

describe('AddPlayerCard', () => {
  let component: AddPlayerCard;
  let fixture: ComponentFixture<AddPlayerCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPlayerCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPlayerCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
