export interface PolicyComponent {
  codigo: string;       // Código del componente
  material: string;     // Nombre de la cobertura
  uso: string;          // Uso (multiplicador)
  unidades: string;     // Número de unidades
  cantidad: string;     // Cantidad
  peso: string;         // Valor unitario
  consumo: string;      // Subtotal
  porcentaje: string;   // Porcentaje del total
}

export interface PolicyCoverage {
  id: number | string;
  name: string;         // Nombre de la cobertura
  description?: string; // Descripción detallada
  amount: number;       // Monto cubierto
  percentage: number;   // Porcentaje de la prima total
  isOptional: boolean;  // Si es una cobertura opcional
  isActive: boolean;    // Si está activa
} 