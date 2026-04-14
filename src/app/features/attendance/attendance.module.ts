import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { AttendanceReportComponent } from './attendance-report.component';
import { MarkAttendanceComponent } from './mark-attendance.component';
import { AttendanceRoutingModule } from './attendance-routing.module';

@NgModule({
  declarations: [MarkAttendanceComponent, AttendanceReportComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AttendanceRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  exports: []
})
export class AttendanceModule {}
