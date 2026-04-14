import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  @Input() text = '';
  @Input() type: 'success' | 'warning' | 'danger' | 'info' | 'default' = 'default';
}
