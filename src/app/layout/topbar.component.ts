import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';

import { Notification } from '../core/models/notification.model';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  readonly appName = 'Smart Workforce';
  readonly notifications$: Observable<Notification[]> = this.notificationService.notifications$;
  readonly unreadCount$ = this.notificationService.getUnreadCount();
  readonly currentUser$ = this.authService.currentUser$.pipe(map((user) => user));
  readonly searchControl = new FormControl('');

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  runGlobalSearch(): void {
    const term = (this.searchControl.value || '').trim();
    this.router.navigate(['/employees'], {
      queryParams: {
        search: term || null
      }
    });
  }

  markRead(id: string): void {
    this.notificationService.markRead(id);
  }

  markAllRead(notifications: Notification[]): void {
    notifications.filter((notification) => !notification.read).forEach((notification) => {
      this.notificationService.markRead(notification.id);
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
