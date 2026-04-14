import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-rejection-note-dialog',
  templateUrl: './rejection-note-dialog.component.html',
  styleUrls: ['./rejection-note-dialog.component.scss']
})
export class RejectionNoteDialogComponent {
  readonly form = this.formBuilder.group({
    note: ['', [Validators.required, Validators.minLength(5)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<RejectionNoteDialogComponent>
  ) {}

  get noteControl(): FormControl {
    return this.form.get('note') as FormControl;
  }

  close(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.noteControl?.value || '');
  }
}
