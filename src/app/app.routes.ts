import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        loadChildren: () => import('./auth/auth.routes').then(m => m.routes),
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./home/home.routes').then(m => m.routes),
        canActivate: [() => {
            const authService = inject(AuthService);
            const router = inject(Router);
            
            if (authService.isAuthenticated()) {
                return true;
            }
            
            return router.createUrlTree(['/']);
        }]
    }
];
