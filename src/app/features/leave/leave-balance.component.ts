import { Component, OnInit } from '@angular/core';

import { LeaveType } from '../../core/models/leave.model';
import { AuthService } from '../../core/services/auth.service';
import { LeaveService } from '../../core/services/leave.service';

interface LeaveBalanceCard {
  type: string;
  total: number;
  used: number;
  remaining: number;
}

@Component({
  selector: 'app-leave-balance',
  templateUrl: './leave-balance.component.html',
  styleUrls: ['./leave-balance.component.scss']
})
export class LeaveBalanceComponent implements OnInit {
  cards: LeaveBalanceCard[] = [];

  ngOnInit(): void {
    const employeeId = this.authService.getCurrentUser().employeeId;
    this.leaveService.getByEmployee(employeeId).subscribe((leaves) => {
      const totals = {
        casual: 12,
        sick: 10,
        annual: 20
      };

      const used = {
        casual: leaves
          .filter((leave) => leave.type === LeaveType.Casual && leave.status === 'Approved')
          .reduce((acc, leave) => acc + daySpan(leave.startDate, leave.endDate), 0),
        sick: leaves
          .filter((leave) => leave.type === LeaveType.Sick && leave.status === 'Approved')
          .reduce((acc, leave) => acc + daySpan(leave.startDate, leave.endDate), 0),
        annual: leaves
          .filter((leave) => leave.type === LeaveType.Annual && leave.status === 'Approved')
          .reduce((acc, leave) => acc + daySpan(leave.startDate, leave.endDate), 0)
      };

      this.cards = [
        {
          type: 'Casual',
          total: totals.casual,
          used: used.casual,
          remaining: Math.max(totals.casual - used.casual, 0)
        },
        {
          type: 'Sick',
          total: totals.sick,
          used: used.sick,
          remaining: Math.max(totals.sick - used.sick, 0)
        },
        {
          type: 'Annual',
          total: totals.annual,
          used: used.annual,
          remaining: Math.max(totals.annual - used.annual, 0)
        }
      ];
    });
  }

  constructor(private readonly leaveService: LeaveService, private readonly authService: AuthService) {}
}

function daySpan(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}
