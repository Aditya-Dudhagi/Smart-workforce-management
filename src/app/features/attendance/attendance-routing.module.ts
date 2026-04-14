import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AttendanceReportComponent } from './attendance-report.component';
import { MarkAttendanceComponent } from './mark-attendance.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'mark',
    pathMatch: 'full'
  },
  {
    path: 'mark',
    component: MarkAttendanceComponent
  },
  {
    path: 'report',
    component: AttendanceReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule {}
