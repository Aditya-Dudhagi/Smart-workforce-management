import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Attendance, AttendanceStatus } from '../../core/models/attendance.model';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';

@Component({
  selector: 'app-mark-attendance',
  templateUrl: './mark-attendance.component.html',
  styleUrls: ['./mark-attendance.component.scss']
})
export class MarkAttendanceComponent implements OnInit {
  readonly today = new Date();
  readonly statusControl = new FormControl(AttendanceStatus.Present);

  todayRecord: Attendance | null = null;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.refreshTodayStatus();
  }

  checkIn(): void {
    const user = this.authService.getCurrentUser();
    const now = new Date();

    const status = this.canManageStatus() ? this.statusControl.value : AttendanceStatus.Present;

    this.attendanceService
      .markAttendance({
        id: this.todayRecord?.id || '',
        employeeId: user.employeeId,
        date: this.todayIsoDate(),
        checkIn: formatTime(now),
        checkOut: this.todayRecord?.checkOut || '',
        status
      })
      .subscribe((record) => {
        this.todayRecord = record;
      });
  }

  checkOut(): void {
    if (!this.todayRecord) {
      return;
    }

    const now = new Date();
    const status = this.canManageStatus() ? this.statusControl.value : this.todayRecord.status;

    this.attendanceService
      .markAttendance({
        ...this.todayRecord,
        checkOut: formatTime(now),
        status
      })
      .subscribe((record) => {
        this.todayRecord = record;
      });
  }

  canManageStatus(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('HR');
  }

  private refreshTodayStatus(): void {
    const employeeId = this.authService.getCurrentUser().employeeId;
    this.attendanceService.getTodayStatus(employeeId).subscribe((record) => {
      this.todayRecord = record;
      if (record) {
        this.statusControl.setValue(record.status);
      }
    });
  }

  private todayIsoDate(): string {
    return this.today.toISOString().slice(0, 10);
  }
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}
