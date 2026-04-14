import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { combineLatest, map, startWith, switchMap } from 'rxjs';

import { Leave, LeaveStatus } from '../../core/models/leave.model';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { LeaveService } from '../../core/services/leave.service';
import { NotificationType } from '../../core/models/notification.model';
import { NotificationService } from '../../core/services/notification.service';
import { RejectionNoteDialogComponent } from './dialogs/rejection-note-dialog/rejection-note-dialog.component';

interface LeaveListRow {
  id: string;
  employeeName: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
}

@Component({
  selector: 'app-leave-list',
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss']
})
export class LeaveListComponent implements OnInit {
  readonly displayedColumns = ['employeeName', 'type', 'dates', 'reason', 'status', 'actions'];
  readonly statuses = ['All', 'Pending', 'Approved', 'Rejected'];
  readonly departments = ['All', 'Engineering', 'HR', 'Finance'];

  readonly filtersForm = this.formBuilder.group({
    status: ['All'],
    department: ['All'],
    fromDate: [''],
    toDate: ['']
  });

  readonly rows$ = combineLatest([
    this.leaveService.getPending().pipe(switchMap(() => this.leaveService.leaves$)),
    this.employeeService.getAll(),
    this.filtersForm.valueChanges.pipe(startWith(this.filtersForm.value))
  ]).pipe(
    map(([leaves, employees, filters]) => {
      const employeeMap = new Map(
        employees.map((employee) => [employee.id, { name: employee.firstName + ' ' + employee.lastName, department: employee.department }])
      );

      return leaves
        .map((leave) => {
          const employee = employeeMap.get(leave.employeeId);
          return {
            id: leave.id,
            employeeName: employee?.name || 'Unknown Employee',
            department: employee?.department || 'Unknown',
            type: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
            status: leave.status
          } as LeaveListRow;
        })
        .filter((row) => {
          const statusMatch = !filters.status || filters.status === 'All' || row.status === filters.status;
          const departmentMatch =
            !filters.department || filters.department === 'All' || row.department === filters.department;

          const rowStart = new Date(row.startDate).getTime();
          const fromMatch = !filters.fromDate || rowStart >= new Date(filters.fromDate).getTime();
          const toMatch = !filters.toDate || rowStart <= new Date(filters.toDate).getTime();

          return statusMatch && departmentMatch && fromMatch && toMatch;
        });
    })
  );

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly leaveService: LeaveService,
    private readonly employeeService: EmployeeService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.hasRole('Employee')) {
      this.router.navigate(['/leave/history']);
    }
  }

  approve(row: LeaveListRow): void {
    const reviewerId = this.authService.getCurrentUser().employeeId;
    this.leaveService.approve(row.id, reviewerId).subscribe(() => {
      this.notificationService.add('Leave approved', NotificationType.Success);
    });
  }

  reject(row: LeaveListRow): void {
    this.dialog
      .open(RejectionNoteDialogComponent, { width: '420px' })
      .afterClosed()
      .pipe(
        switchMap((note) => {
          if (!note) {
            return [];
          }

          const reviewerId = this.authService.getCurrentUser().employeeId;
          return this.leaveService.reject(row.id, reviewerId).pipe(
            map((leave) => ({ leave, note }))
          );
        })
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.notificationService.add('Leave rejected: ' + result.note, NotificationType.Warning);
      });
  }

  canReview(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('HR');
  }
}
