import { Component, OnInit } from '@angular/core';

import { Leave, LeaveStatus } from '../../core/models/leave.model';
import { NotificationType } from '../../core/models/notification.model';
import { AuthService } from '../../core/services/auth.service';
import { LeaveService } from '../../core/services/leave.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-leave-history',
  templateUrl: './leave-history.component.html',
  styleUrls: ['./leave-history.component.scss']
})
export class LeaveHistoryComponent implements OnInit {
  readonly displayedColumns = ['type', 'startDate', 'endDate', 'reason', 'status', 'actions'];
  rows: Leave[] = [];

  constructor(
    private readonly leaveService: LeaveService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const employeeId = this.authService.getCurrentUser().employeeId;
    this.leaveService.getByEmployee(employeeId).subscribe((leaves) => {
      this.rows = leaves;
    });
  }

  cancelLeave(leave: Leave): void {
    if (leave.status !== 'Pending') {
      return;
    }

    const employeeId = this.authService.getCurrentUser().employeeId;
    this.leaveService.reject(leave.id, employeeId).subscribe(() => {
      this.notificationService.add('Leave request cancelled', NotificationType.Info);
      this.rows = this.rows.map((item) => (item.id === leave.id ? { ...item, status: LeaveStatus.Rejected } : item));
    });
  }
}
