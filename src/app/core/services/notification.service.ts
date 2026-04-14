import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Notification, NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly storageKey = 'swm_notifications';

  private readonly notificationsSubject = new BehaviorSubject<Notification[]>(this.readStoredNotifications());
  readonly notifications$ = this.notificationsSubject.asObservable();

  /**
   * Adds a notification and persists it.
   */
  add(message: string, type: NotificationType): void {
    const next: Notification = {
      id: uuidv4(),
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };

    const updated = [next, ...this.notificationsSubject.value];
    this.persist(updated);
  }

  /**
   * Marks a notification as read.
   */
  markRead(id: string): void {
    const updated = this.notificationsSubject.value.map((item) =>
      item.id === id
        ? {
            ...item,
            read: true
          }
        : item
    );

    this.persist(updated);
  }

  /**
   * Returns unread notification count.
   */
  getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map((items) => items.filter((item) => !item.read).length),
      catchError(() => of(0))
    );
  }

  /**
   * Removes all notifications.
   */
  clearAll(): void {
    this.persist([]);
  }

  private readStoredNotifications(): Notification[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as Notification[];
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private persist(notifications: Notification[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    this.notificationsSubject.next(notifications);
  }
}
