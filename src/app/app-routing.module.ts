import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule),
    data: { animation: 'auth' }
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { animation: 'app' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule)
      },
      {
        path: 'employees',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin', 'HR'] },
        loadChildren: () => import('./features/employee/employee.module').then((m) => m.EmployeeModule)
      },
      {
        path: 'leave',
        loadChildren: () => import('./features/leave/leave.module').then((m) => m.LeaveModule)
      },
      {
        path: 'attendance',
        loadChildren: () => import('./features/attendance/attendance.module').then((m) => m.AttendanceModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
