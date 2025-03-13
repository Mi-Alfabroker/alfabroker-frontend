import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  Policy, 
  PolicyComponent as PolicyComponentModel, 
  UserRole, 
  TipoPoliza, 
  DatosVehiculo,
  DatosHogar,
  DatosCopropiedad,
  DatosGeneral,
  CoberturaAseguradora
} from '../../../core/models';
import { PolicyService } from '../../../core/services/policy.service';
import { LoadingService } from '../../../core/services/loading.service';
import { UserService } from '../../../core/services/user.service';
import { finalize, forkJoin, of } from 'rxjs';
import { User } from '../../../core/store/auth/auth.types';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './policy-detail.component.html',
  styleUrl: './policy-detail.component.css'
})
export class PolicyDetailComponent implements OnInit {
  policy: Policy | null = null;
  isEditing = false;
  userRole: UserRole = UserRole.ADMIN; // Esto vendría de un servicio de autenticación
  isLoading = false;
  error: string | null = null;
  assignedUser: User | null = null;
  
  // Exponer el enum TipoPoliza para usarlo en la plantilla
  TipoPoliza = TipoPoliza;

  // Array para almacenar los componentes de la póliza
  components: PolicyComponentModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private policyService: PolicyService,
    private loadingService: LoadingService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadPolicy();
  }

  loadPolicy(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de póliza no válido';
      return;
    }

    this.isLoading = true;
    this.loadingService.show('Cargando detalles de la póliza...');

    this.policyService.getPolicyById(Number(id))
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loadingService.hide();
        })
      )
      .subscribe({
        next: (policy) => {
          if (policy) {
            this.policy = policy;
            console.log("policy", this.policy);
            this.error = null;
            
            // Actualizar los componentes según las coberturas de la póliza
            this.updateComponentsFromPolicy();
            
            // Cargar la información del usuario asignado
            this.loadAssignedUser();
          } else {
            this.error = 'No se encontró la póliza solicitada';
          }
        },
        error: (err) => {
          console.error(`Error al cargar la póliza con ID ${id}:`, err);
          this.error = 'No se pudo cargar la póliza. Por favor, inténtalo de nuevo más tarde.';
        }
      });
  }

  loadAssignedUser(): void {
    if (!this.policy || !this.policy.id_user) {
      return;
    }

    this.userService.getUserById(this.policy.id_user)
      .subscribe({
        next: (user) => {
          this.assignedUser = user;
        },
        error: (err) => {
          console.error(`Error al cargar el usuario asignado con ID ${this.policy?.id_user}:`, err);
        }
      });
  }

  updateComponentsFromPolicy(): void {
    if (!this.policy || !this.policy.coberturas) {
      this.components = [];
      return;
    }

    // Calcular el total de los valores de las coberturas
    const totalValue = this.policy.coberturas.reduce((sum, cobertura) => {
      // Si el valor es un número, sumarlo; si es una cadena (como "Incluida"), no sumarlo
      const valorNumerico = typeof cobertura.valor === 'number' ? cobertura.valor : 0;
      return sum + valorNumerico;
    }, 0);

    // Convertir las coberturas en componentes para la tabla
    this.components = this.policy.coberturas.map((cobertura, index) => {
      // Calcular el porcentaje solo si el valor es numérico y el total es mayor que cero
      const valorNumerico = typeof cobertura.valor === 'number' ? cobertura.valor : 0;
      const porcentaje = totalValue > 0 ? (valorNumerico / totalValue * 100) : 0;
      
      // Formatear el valor para mostrarlo correctamente
      const valorFormateado = typeof cobertura.valor === 'number' 
        ? `${cobertura.valor.toLocaleString('es-CO')} $` 
        : cobertura.valor;

      return {
        codigo: `COB-${(index + 1).toString().padStart(4, '0')}`,
        material: cobertura.nombre,
        peso: valorFormateado,
        porcentaje: porcentaje.toFixed(2),
        // Campos requeridos por la interfaz pero que no usamos
        uso: '-',
        unidades: '-',
        cantidad: '-',
        consumo: valorFormateado
      };
    });
  }

  canEdit(): boolean {
    return this.userRole === UserRole.ADMIN || this.userRole === UserRole.AGENT;
  }

  toggleEdit(): void {
    if (this.canEdit()) {
      this.isEditing = !this.isEditing;
    }
  }

  saveChanges(): void {
    if (!this.policy) {
      return;
    }

    this.isLoading = true;
    this.loadingService.show('Guardando cambios...');

    this.policyService.updatePolicy(this.policy.id, this.policy)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loadingService.hide();
        })
      )
      .subscribe({
        next: (updatedPolicy) => {
          if (updatedPolicy) {
            this.policy = updatedPolicy;
            this.isEditing = false;
            this.error = null;
          } else {
            this.error = 'No se pudieron guardar los cambios. Por favor, inténtalo de nuevo más tarde.';
          }
        },
        error: (err) => {
          console.error('Error al guardar los cambios:', err);
          this.error = 'No se pudieron guardar los cambios. Por favor, inténtalo de nuevo más tarde.';
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/policy']);
  }

  getTotalAmount(): string {
    if (!this.policy) return '0';
    
    // Calcular el total de las coberturas
    const total = this.policy.coberturas?.reduce((sum, cobertura) => {
      return sum + (typeof cobertura.valor === 'number' ? cobertura.valor : 0);
    }, 0) || 0;
    
    return total.toLocaleString();
  }

  // Método para calcular el precio total de la póliza
  getTotalPrice(): number {
    if (!this.policy) return 0;
    
    const primaNeta = this.policy.prima_neta || 0;
    const iva = this.policy.iva || 0;
    const gastosExpedicion = this.policy.gastos_expedicion || 0;
    
    return primaNeta + iva + gastosExpedicion;
  }

  // Método para verificar el tipo de datos de la póliza
  isPolicyType(type: TipoPoliza): boolean {
    return this.policy?.tipo_poliza === type;
  }

  // Método para obtener los datos específicos según el tipo de póliza
  getSpecificData(): any {
    if (!this.policy || !this.policy.data) return null;
    
    // Verificar el tipo de póliza y devolver los datos tipados correctamente
    switch (this.policy.tipo_poliza) {
      case TipoPoliza.VEHICULOS:
        return this.policy.data as DatosVehiculo;
      case TipoPoliza.HOGAR:
        return this.policy.data as DatosHogar;
      case TipoPoliza.COPROPIEDADES:
        return this.policy.data as DatosCopropiedad;
      default:
        return this.policy.data as DatosGeneral;
    }
  }
}
