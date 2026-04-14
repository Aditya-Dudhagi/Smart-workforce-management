export enum NotificationType {
  Success = 'success',
  Warning = 'warning',
  Info = 'info',
  Danger = 'danger'
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
}
