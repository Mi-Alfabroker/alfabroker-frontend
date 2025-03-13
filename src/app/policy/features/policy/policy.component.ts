import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PolicyCardComponent } from '../../../shared/policy-card/policy-card.component';
import { Policy } from '../../../core/models';
import { PolicyService } from '../../../core/services/policy.service';
import { LoadingService } from '../../../core/services/loading.service';
import { finalize } from 'rxjs';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { PolicyFormComponent } from '../policy-form/policy-form.component';

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, PolicyCardComponent, ModalComponent],
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.css'
})
export class PolicyComponent implements OnInit {
  policies: Policy[] = [];
  isLoading = false;
  error: string | null = null;
  showModal = false;
  modalTitle = '';
  modalComponent: any = null;
  modalInputs: any = {};

  constructor(
    private router: Router,
    private policyService: PolicyService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.isLoading = true;
    this.loadingService.show('Cargando pólizas...');

    this.policyService.getPoliciesByUser()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loadingService.hide();
        })
      )
      .subscribe({
        next: (policies) => {
          this.policies = policies;
          this.error = null;
          
          // Si no hay pólizas, mostrar un mensaje informativo
          if (policies.length === 0) {
            this.error = 'No se encontraron pólizas para este usuario. Puede crear una nueva póliza usando el botón "Nueva Póliza".';
          }
        },
        error: (err) => {
          console.error('Error al cargar las pólizas:', err);
          
          // Verificar si el error es por falta de autenticación
          if (err.status === 401) {
            this.error = 'No has iniciado sesión o tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          } else if (err.status === 403) {
            this.error = 'No tienes permisos para ver estas pólizas.';
          } else {
            this.error = 'No se pudieron cargar las pólizas. Por favor, inténtalo de nuevo más tarde.';
          }
          
        }
      });
  }

  viewPolicy(policy: Policy): void {
    console.log('Ver póliza:', policy);
    // Navegar a la página de detalle de póliza
    this.router.navigate(['/policy', policy.id]);
  }

  copyPolicy(policy: Policy): void {
    console.log('Copiar póliza:', policy);
    // Aquí iría la lógica para copiar la póliza
  }

  deletePolicy(policy: Policy): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar la póliza "${policy.title}"?`)) {
      return;
    }

    this.loadingService.show('Eliminando póliza...');
    
    this.policyService.deletePolicy(policy.id)
      .pipe(
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (success) => {
          if (success) {
            this.policies = this.policies.filter(p => p.id !== policy.id);
          } else {
            this.error = 'No se pudo eliminar la póliza. Por favor, inténtalo de nuevo más tarde.';
          }
        },
        error: (err) => {
          console.error('Error al eliminar la póliza:', err);
          this.error = 'No se pudo eliminar la póliza. Por favor, inténtalo de nuevo más tarde.';
        }
      });
  }

  openNewPolicyModal(): void {
    this.modalTitle = 'Nueva Póliza';
    this.modalComponent = PolicyFormComponent;
    this.modalInputs = {};
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  handleModalOutput(policy: Policy): void {
    console.log('Nueva póliza creada:', policy);
    this.loadPolicies();
  }
}
