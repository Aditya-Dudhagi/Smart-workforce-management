import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { LeaveApplyComponent } from './leave-apply.component';
import { LeaveBalanceComponent } from './leave-balance.component';
import { LeaveHistoryComponent } from './leave-history.component';
import { LeaveListComponent } from './leave-list.component';
import { LeaveRoutingModule } from './leave-routing.module';
import { RejectionNoteDialogComponent } from './dialogs/rejection-note-dialog/rejection-note-dialog.component';

@NgModule({
  declarations: [
    LeaveListComponent,
    LeaveApplyComponent,
    LeaveBalanceComponent,
    LeaveHistoryComponent,
    RejectionNoteDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LeaveRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule
  ],
  exports: []
})
export class LeaveModule {}
