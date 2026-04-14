import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleGuard } from '../../core/guards/role.guard';
import { LeaveApplyComponent } from './leave-apply.component';
import { LeaveBalanceComponent } from './leave-balance.component';
import { LeaveHistoryComponent } from './leave-history.component';
import { LeaveListComponent } from './leave-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: LeaveListComponent
  },
  {
    path: 'history',
    component: LeaveHistoryComponent
  },
  {
    path: 'apply',
    component: LeaveApplyComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Employee'] }
  },
  {
    path: 'balance',
    component: LeaveBalanceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveRoutingModule {}
