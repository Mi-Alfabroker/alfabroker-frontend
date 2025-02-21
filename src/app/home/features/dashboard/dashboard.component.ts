import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from "../../../shared/sidebar/sidebar.component";
import { Store } from '@ngrx/store';
import * as AuthSelectors from '@core/store/auth/auth.selectors';
import { User } from '@core/store/auth/auth.types';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  user$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;

  constructor(private store: Store) {
    // Obtener el usuario
    this.user$ = this.store.select(AuthSelectors.selectUser);
    // Obtener el estado de autenticación
    this.isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
  }

  ngOnInit() {
    
    // Subscribirse al usuario del store
    this.store.select(AuthSelectors.selectUser).subscribe(user => {
    });

    // Subscribirse al token
    this.store.select(AuthSelectors.selectToken).subscribe(token => {
    });

    // Subscribirse al estado de autenticación
    this.store.select(AuthSelectors.selectIsAuthenticated).subscribe(isAuth => {
    });
  }

  onMenuItemSelected(): void {
    // Aquí puedes agregar lógica adicional si es necesario
  }
}
