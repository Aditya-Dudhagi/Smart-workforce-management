import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent {
  @Input() title = '';
  @Input() value = 0;
  @Input() icon = 'insights';
  @Input() color = '#1976d2';
}
