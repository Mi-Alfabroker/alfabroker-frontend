import { Routes } from '@angular/router';
import { PolicyComponent } from './features/policy/policy.component';
import { PolicyDetailComponent } from './features/policy-detail/policy-detail.component';

export const routes: Routes = [
    {
        path: '',
        component: PolicyComponent,
    },
    {
        path: ':id',
        component: PolicyDetailComponent,
    }
];