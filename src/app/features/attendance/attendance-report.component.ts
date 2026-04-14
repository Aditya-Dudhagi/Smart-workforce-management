import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, startWith } from 'rxjs';

import { Attendance } from '../../core/models/attendance.model';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';

type DayStatus = 'Present' | 'Absent' | 'Half-Day' | 'Leave' | 'Weekend' | '';

interface DayCell {
  label: string;
  day: number | null;
  status: DayStatus;
}

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {
  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  readonly years = [2024, 2025, 2026, 2027, 2028];

  readonly monthControl = new FormControl(new Date().getMonth() + 1);
  readonly yearControl = new FormControl(new Date().getFullYear());

  calendarCells: DayCell[] = [];
  summary = {
    present: 0,
    absent: 0,
    leave: 0
  };

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.monthControl.valueChanges.pipe(startWith(this.monthControl.value)),
      this.yearControl.valueChanges.pipe(startWith(this.yearControl.value))
    ]).subscribe(([month, year]) => {
      this.loadReport(month, year);
    });
  }

  private loadReport(month: number, year: number): void {
    const employeeId = this.authService.getCurrentUser().employeeId;
    this.attendanceService.getMonthlyReport(employeeId, month, year).subscribe((records) => {
      this.buildCalendar(records, month, year);
      this.summary = {
        present: records.filter((record) => record.status === 'Present').length,
        absent: this.calendarCells.filter((cell) => cell.day && cell.status === 'Absent').length,
        leave: records.filter((record) => record.status === 'Leave').length
      };
    });
  }

  private buildCalendar(records: Attendance[], month: number, year: number): void {
    const statusByDay = new Map<number, DayStatus>();
    records.forEach((record) => {
      const day = new Date(record.date).getDate();
      statusByDay.set(day, record.status as DayStatus);
    });

    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    const cells: DayCell[] = [];

    for (let i = 0; i < firstDay.getDay(); i += 1) {
      cells.push({ label: '', day: null, status: '' });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month - 1, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const status = isWeekend ? 'Weekend' : statusByDay.get(day) || 'Absent';
      cells.push({ label: String(day), day, status });
    }

    this.calendarCells = cells;
  }
}
