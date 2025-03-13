import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Policy, TipoPoliza, DatosVehiculo, DatosHogar } from '../../core/models';

@Component({
  selector: 'app-policy-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policy-card.component.html'
})
export class PolicyCardComponent implements OnInit {
  @Input() policy!: Policy;
  @Output() viewPolicy = new EventEmitter<Policy>();
  @Output() copyPolicy = new EventEmitter<Policy>();
  @Output() deletePolicy = new EventEmitter<Policy>();

  // Valores precalculados para evitar cambios durante la detección de cambios
  coveragePercentage: number = 90;
  insuredValue: number = 0;
  durationDays: number = 0;
  beneficiaryCount: number = 1;
  commissionPercentage: number = 15;

  ngOnInit(): void {
    // Calcular todos los valores una sola vez al inicializar el componente
    this.insuredValue = this.calculateInsuredValue();
    this.durationDays = this.calculateDurationDays();
    this.beneficiaryCount = this.calculateBeneficiaryCount();
  }

  onView(): void {
    this.viewPolicy.emit(this.policy);
  }

  onCopy(): void {
    this.copyPolicy.emit(this.policy);
  }

  onDelete(): void {
    this.deletePolicy.emit(this.policy);
  }

  // Método para obtener el porcentaje de cobertura (ahora devuelve el valor precalculado)
  getCoveragePercentage(): number {
    return this.coveragePercentage;
  }

  // Método para calcular el valor asegurado
  private calculateInsuredValue(): number {
    if (!this.policy.data) return 0;

    switch (this.policy.tipo_poliza) {
      case TipoPoliza.VEHICULOS:
        const datosVehiculo = this.policy.data as DatosVehiculo;
        return Number(datosVehiculo.valor_vehiculo || 0) + Number(datosVehiculo.valor_accesorios || 0);
      case TipoPoliza.HOGAR:
        const datosHogar = this.policy.data as DatosHogar;
        return Number(datosHogar.valor_inmueble || 0) + 
               Number(datosHogar.valor_contenidos_normales || 0) + 
               Number(datosHogar.valor_equipos_electronicos || 0) + 
               Number(datosHogar.valor_contenidos_especiales || 0);
      default:
        // Para otros tipos de pólizas, podríamos obtener el valor del primer elemento de coberturas
        if (this.policy.coberturas && this.policy.coberturas.length > 0) {
          return Number(this.policy.coberturas[0].valor || 0);
        }
        return 0;
    }
  }

  // Método para obtener el valor asegurado (ahora devuelve el valor precalculado)
  getInsuredValue(): number {
    return this.insuredValue;
  }

  // Método para calcular la duración en días
  private calculateDurationDays(): number {
    if (!this.policy.fecha_inicio || !this.policy.fecha_fin) return 0;
    
    const fechaInicio = new Date(this.policy.fecha_inicio);
    const fechaFin = new Date(this.policy.fecha_fin);
    
    // Calcular la diferencia en milisegundos y convertirla a días
    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Método para obtener la duración en días (ahora devuelve el valor precalculado)
  getDurationDays(): number {
    return this.durationDays;
  }

  // Método para calcular el número de beneficiarios
  private calculateBeneficiaryCount(): number {
    // Si hay un beneficiario explícito, devolvemos 1
    if (this.policy.beneficiario) return 1;
    
    // Valor fijo para evitar cambios aleatorios
    return 1;
  }

  // Método para obtener el número de beneficiarios (ahora devuelve el valor precalculado)
  getBeneficiaryCount(): number {
    return this.beneficiaryCount;
  }

  // Método para obtener el porcentaje de comisión (ahora devuelve el valor precalculado)
  getCommissionPercentage(): number {
    return this.commissionPercentage;
  }

  // Método para formatear valores de moneda
  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(Number(value))) return '0';
    
    value = Number(value);
    
    // Si el valor es mayor a un millón, lo mostramos en millones
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    
    // Si el valor es mayor a mil, lo mostramos en miles
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    
    // De lo contrario, mostramos el valor completo
    return value.toString();
  }
}
