import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of, switchMap } from 'rxjs';

import { Attendance, AttendanceStatus } from '../../core/models/attendance.model';
import { Employee } from '../../core/models/employee.model';
import { Leave } from '../../core/models/leave.model';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { EmployeeService } from '../../core/services/employee.service';
import { LeaveService } from '../../core/services/leave.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})
export class EmployeeProfileComponent implements OnInit {
  employee: Employee | null = null;
  leaves: Leave[] = [];
  attendanceSummary = {
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0
  };

  readonly leaveColumns = ['type', 'status', 'startDate', 'endDate'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly employeeService: EmployeeService,
    private readonly leaveService: LeaveService,
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const employeeId = params.get('id');
          if (!employeeId) {
            return of(null);
          }

          const today = new Date();
          const month = today.getMonth() + 1;
          const year = today.getFullYear();

          return combineLatest([
            this.employeeService.getById(employeeId),
            this.leaveService.getByEmployee(employeeId),
            this.attendanceService.getMonthlyReport(employeeId, month, year)
          ]);
        })
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }

        const [employee, leaves, attendanceRecords] = result;
        this.employee = employee;
        this.leaves = leaves;
        this.attendanceSummary = this.buildAttendanceSummary(attendanceRecords);
      });
  }

  canEdit(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('HR');
  }

  editProfile(): void {
    if (!this.employee) {
      return;
    }

    this.router.navigate(['/employees/edit', this.employee.id]);
  }

  getInitials(): string {
    if (!this.employee) {
      return '';
    }

    return (this.employee.firstName.charAt(0) + this.employee.lastName.charAt(0)).toUpperCase();
  }

  private buildAttendanceSummary(records: Attendance[]): { present: number; absent: number; halfDay: number; leave: number } {
    return records.reduce(
      (acc, record) => {
        if (record.status === AttendanceStatus.Present) {
          acc.present += 1;
        }
        if (record.status === AttendanceStatus.Absent) {
          acc.absent += 1;
        }
        if (record.status === AttendanceStatus.HalfDay) {
          acc.halfDay += 1;
        }
        if (record.status === AttendanceStatus.Leave) {
          acc.leave += 1;
        }
        return acc;
      },
      { present: 0, absent: 0, halfDay: 0, leave: 0 }
    );
  }
}
