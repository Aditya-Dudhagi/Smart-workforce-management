import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnDestroy {
  private roles: string[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainer: ViewContainerRef,
    private readonly authService: AuthService
  ) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateView();
    });
  }

  @Input()
  set appHasRole(value: string[]) {
    this.roles = value || [];
    this.updateView();
  }

  private updateView(): void {
    const canShow = this.roles.some((role) => this.authService.hasRole(role));

    this.viewContainer.clear();
    if (canShow) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
