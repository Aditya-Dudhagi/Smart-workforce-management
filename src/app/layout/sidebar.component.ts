import { Component, EventEmitter, Output } from '@angular/core';

import { AuthService } from '../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Output() readonly navigateOnMobile = new EventEmitter<void>();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['Admin', 'HR', 'Employee'] },
    { label: 'Employees', icon: 'groups', route: '/employees', roles: ['Admin', 'HR'] },
    { label: 'Leave', icon: 'event_available', route: '/leave', roles: ['Admin', 'HR', 'Employee'] },
    { label: 'Attendance', icon: 'schedule', route: '/attendance', roles: ['Admin', 'HR', 'Employee'] }
  ];

  constructor(private readonly authService: AuthService) {}

  canView(roles: string[]): boolean {
    return roles.some((role) => this.authService.hasRole(role));
  }

  onNavigate(): void {
    this.navigateOnMobile.emit();
  }
}
