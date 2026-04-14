import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { animate, query, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeFade', [
      transition('* <=> *', [
        query(':enter', [style({ opacity: 0 })], { optional: true }),
        query(':enter', [animate('200ms ease', style({ opacity: 1 }))], { optional: true })
      ])
    ])
  ]
})
export class AppComponent {
  title = 'smart-workforce-mgmt';

  prepareRoute(outlet: RouterOutlet): string {
    return (outlet?.activatedRouteData?.['animation'] as string) || '';
  }
}
