import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <section style="padding: 2rem; text-align: center;">
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page.</p>
      <button type="button" (click)="goBack()">Back</button>
    </section>
  `
})
export class UnauthorizedComponent {
  constructor(private readonly location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
