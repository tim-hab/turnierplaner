import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appSelectOnFocusDirective]',
})
export class SelectOnFocusDirective implements AfterViewInit {
  private el = inject(ElementRef<HTMLInputElement>);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.el.nativeElement.focus();
      this.el.nativeElement.select();
    });
  }
}
