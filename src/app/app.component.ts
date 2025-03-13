import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { LoadingComponent } from './shared/loading/loading.component';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { AsyncPipe } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, LoadingComponent, AsyncPipe],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'alfabroker-frontend';
  initialized = true;
  
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  isLoading = this.loadingService.loading$;
  loadingMessage = this.loadingService.loadingMessage$;

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
  
  ngOnInit() {
    // Configurar eventos de navegación
    this.setupNavigationEvents();
  }

  private setupNavigationEvents(): void {
    this.router.events.pipe(
      filter(event => 
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show('Cargando página...');
      } else {
        this.loadingService.hide();
      }
    });
  }
}