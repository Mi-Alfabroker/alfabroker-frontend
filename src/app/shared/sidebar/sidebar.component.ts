import { Component, Output, EventEmitter, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NAV_ROUTES, NavRoute } from '../../core/interfaces/route.interface';
import { AuthService } from '../../core/services/auth.service';
import { Store } from '@ngrx/store';
import * as AuthSelectors from '../../core/store/auth/auth.selectors';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output() menuSelected = new EventEmitter<void>();
  
  private store = inject(Store);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);

  isOpen = false;
  routes: NavRoute[] = NAV_ROUTES;
  user$ = this.store.select(AuthSelectors.selectUser);

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    this.closeSidebar();
    this.authService.logout();
  }

  sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  isRouteActive(path: string): boolean {
    return this.router.isActive(path, true);
  }

  closeSidebar(): void {
    this.isOpen = false;
    this.menuSelected.emit();
  }

  onMenuItemClick(path: string): void {
    this.router.navigate([path]);
    this.closeSidebar();
  }
}
