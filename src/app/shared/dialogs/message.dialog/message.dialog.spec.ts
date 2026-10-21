import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MessageDialog } from './message.dialog';

describe('MessageDialog', () => {
  let component: MessageDialog;
  let fixture: ComponentFixture<MessageDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { message: 'Test message', acceptText: 'OK' } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes with true when the message is accepted', () => {
    const dialogRef = TestBed.inject(MatDialogRef<MessageDialog>);

    component['close']();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('closes with false when the message is aborted', () => {
    const dialogRef = TestBed.inject(MatDialogRef<MessageDialog>);

    component['abort']();

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
