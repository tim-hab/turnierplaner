/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/no-input-rename */
import { FocusMonitor } from '@angular/cdk/a11y';
import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  viewChild,
  inject,
  signal,
  input,
  booleanAttribute,
  model,
  computed,
  ElementRef,
  effect,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormsModule,
  ReactiveFormsModule,
  ControlValueAccessor,
  NgControl,
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { createScoreValidator } from '../score-input-validator';

export class Score {
  constructor(
    public teamA: string,
    public teamB: string,
  ) {}
}

export type ScoreControl = FormGroup<{
  teamA: FormControl<string | null>;
  teamB: FormControl<string | null>;
}>;

/** Custom `MatFormFieldControl` for score number input. */
@Component({
  selector: 'custom-score-input',
  templateUrl: 'score-input.html',
  styleUrl: 'score-input.css',
  providers: [{ provide: MatFormFieldControl, useExisting: CustomScoreInput }],
  host: {
    '[class.example-floating]': 'shouldLabelFloat',
    '[id]': 'id',
  },
  imports: [FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomScoreInput
  implements ControlValueAccessor, MatFormFieldControl<Score>, OnDestroy
{
  static nextId = 0;
  readonly teamAInput = viewChild.required<HTMLInputElement>('teamA');
  readonly teamBInput = viewChild.required<HTMLInputElement>('teamB');
  ngControl = inject(NgControl, { optional: true, self: true });
  readonly score: ScoreControl;
  readonly stateChanges = new Subject<void>();
  readonly touched = signal(false);
  readonly controlType = 'custom-score-input';
  readonly id = `custom-score-input-${CustomScoreInput.nextId++}`;
  readonly _userAriaDescribedBy = input<string>('', { alias: 'aria-describedby' });
  readonly _placeholder = input<string>('', { alias: 'placeholder' });
  readonly _required = input<boolean, unknown>(false, {
    alias: 'required',
    transform: booleanAttribute,
  });
  readonly _disabledByInput = input<boolean, unknown>(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });
  readonly _value = model<Score | null>(null, { alias: 'value' });
  readonly _readonly = input<boolean, unknown>(false, {
    alias: 'readonly',
    transform: booleanAttribute,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (_: unknown) => {
    /* empty */
  };
  onTouched = () => {
    /* empty */
  };

  protected readonly _formField = inject(MAT_FORM_FIELD, {
    optional: true,
  });

  private readonly _focused = signal(false);
  private readonly _disabledByCva = signal(false);
  private readonly _disabled = computed(() => this._disabledByInput() || this._disabledByCva());
  private readonly _focusMonitor = inject(FocusMonitor);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  get focused(): boolean {
    return this._focused();
  }

  get empty() {
    const {
      value: { teamA, teamB },
    } = this.score;

    return !teamA && !teamB;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get userAriaDescribedBy() {
    return this._userAriaDescribedBy();
  }

  get placeholder(): string {
    return this._placeholder();
  }

  get required(): boolean {
    return this._required();
  }

  get disabled(): boolean {
    return this._disabled();
  }

  get value(): Score | null {
    return this._value();
  }

  get errorState(): boolean {
    return this.score.invalid && this.touched();
  }
  constructor() {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    this.score = inject(FormBuilder).group(
      {
        teamA: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(2),
            Validators.pattern(/\d+/),
          ],
        ],
        teamB: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(2),
            Validators.pattern(/\d+/),
          ],
        ],
      },
      {
        validators: [createScoreValidator()],
      },
    );

    effect(() => {
      // Read signals to trigger effect.
      this._placeholder();
      this._required();
      this._disabled();
      this._focused();
      // Propagate state changes.
      untracked(() => this.stateChanges.next());
    });

    effect(() => {
      if (this._disabled()) {
        untracked(() => this.score.disable());
      } else {
        untracked(() => this.score.enable());
      }
    });

    effect(() => {
      const value = this._value() || new Score('', '');
      untracked(() => this.score.setValue(value));
    });

    this.score.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.stateChanges.next();
    });
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  onFocusIn() {
    if (!this._readonly() && !this._focused()) {
      this._focused.set(true);
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched.set(true);
      this._focused.set(false);
      this.onTouched();
    }
  }

  autoFocusNext(control: AbstractControl, nextElement?: HTMLInputElement): void {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, 'program');
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, 'program');
    }
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.custom-score-input-container',
    )!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick() {
    if (this.score.controls.teamB.valid) {
      this._focusMonitor.focusVia(this.teamBInput(), 'program');
    } else if (this.score.controls.teamA.valid) {
      this._focusMonitor.focusVia(this.teamBInput(), 'program');
    } else {
      this._focusMonitor.focusVia(this.teamAInput(), 'program');
    }
  }

  writeValue(tel: Score | null): void {
    this._updateValue(tel);
  }

  registerOnChange(fn: never): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: never): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByCva.set(isDisabled);
  }

  _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
    this._updateValue(new Score(this.score.value.teamA ?? '', this.score.value.teamB ?? ''));
  }

  private _updateValue(score: Score | null) {
    const current = this._value();
    if (score === current || (score?.teamA === current?.teamA && score?.teamB === current?.teamB)) {
      return;
    }
    this._value.set(score);
  }
}
