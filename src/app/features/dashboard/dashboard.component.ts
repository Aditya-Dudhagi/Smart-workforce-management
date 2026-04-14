import { Component } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { combineLatest, map, startWith, switchMap } from 'rxjs';

import { Employee } from '../../core/models/employee.model';
import { Leave, LeaveStatus } from '../../core/models/leave.model';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { LeaveService } from '../../core/services/leave.service';

interface DepartmentCount {
  dept: string;
  count: number;
}

interface RecentLeaveRow {
  employeeName: string;
  type: string;
  status: LeaveStatus;
  date: string;
}

interface DashboardViewModel {
  user: User | null;
  totalEmployees: number;
  departments: number;
  employeesByDepartment: DepartmentCount[];
  leavesThisMonth: number;
  pendingLeaves: number;
  recentLeaves: RecentLeaveRow[];
  leaveBreakdown: number[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly displayedColumns: string[] = ['employeeName', 'type', 'status', 'date'];

  readonly vm$ = combineLatest([
    this.employeeService.getAll(),
    this.leaveService.getPending().pipe(
      switchMap(() => this.leaveService.leaves$),
      startWith([] as Leave[])
    ),
    this.authService.currentUser$.pipe(startWith(null))
  ]).pipe(
    map(([employees, leaves, user]) => this.buildViewModel(employees, leaves, user))
  );

  readonly employeeBarChartData$ = this.vm$.pipe(
    map((vm) => ({
      labels: vm.employeesByDepartment.map((item) => item.dept),
      datasets: [
        {
          data: vm.employeesByDepartment.map((item) => item.count),
          label: 'Employees',
          backgroundColor: ['#3f51b5', '#00acc1', '#26a69a', '#ffb300']
        }
      ]
    }) as any)
  );

  readonly leaveDoughnutChartData$ = this.vm$.pipe(
    map((vm) => ({
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [
        {
          data: vm.leaveBreakdown,
          backgroundColor: ['#ff9800', '#2e7d32', '#d32f2f']
        }
      ]
    }) as any)
  );

  readonly barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  readonly doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly leaveService: LeaveService,
    public readonly authService: AuthService
  ) {}

  showQuickActions(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('HR');
  }

  private buildViewModel(employees: Employee[], leaves: Leave[], user: User | null): DashboardViewModel {
    const employeesByDepartmentMap = employees.reduce((acc, employee) => {
      acc.set(employee.department, (acc.get(employee.department) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());

    const employeesByDepartment = Array.from(employeesByDepartmentMap.entries()).map(([dept, count]) => ({
      dept,
      count
    }));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const leavesThisMonth = leaves.filter((leave) => {
      const leaveDate = new Date(leave.startDate);
      return leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;
    }).length;

    const pendingLeaves = leaves.filter((leave) => leave.status === LeaveStatus.Pending).length;

    const employeeMap = new Map(employees.map((employee) => [employee.id, `${employee.firstName} ${employee.lastName}`]));

    const recentLeaves = [...leaves]
      .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime())
      .slice(0, 5)
      .map((leave) => ({
        employeeName: employeeMap.get(leave.employeeId) ?? 'Unknown Employee',
        type: leave.type,
        status: leave.status,
        date: leave.appliedOn
      }));

    const leaveBreakdown = [
      leaves.filter((leave) => leave.status === LeaveStatus.Pending).length,
      leaves.filter((leave) => leave.status === LeaveStatus.Approved).length,
      leaves.filter((leave) => leave.status === LeaveStatus.Rejected).length
    ];

    return {
      user,
      totalEmployees: employees.length,
      departments: employeesByDepartment.length,
      employeesByDepartment,
      leavesThisMonth,
      pendingLeaves,
      recentLeaves,
      leaveBreakdown
    };
  }
}
