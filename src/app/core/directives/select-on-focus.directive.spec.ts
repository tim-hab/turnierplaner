import { SelectOnFocusDirective } from './select-on-focus.directive';
import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';

describe('SelectOnFocusDirective', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRef,
          useValue: { nativeElement: { focus: vi.fn(), select: vi.fn() } },
        },
      ],
    });

    const directive = TestBed.runInInjectionContext(() => new SelectOnFocusDirective());
    expect(directive).toBeTruthy();
  });
});
