import { Beneficiario, DatosPoliza } from './policy-data.interface';

export interface Policy {
  id: number;
  id_user: number;
  tipo_poliza: TipoPoliza;
  fecha_inicio: Date | string;
  fecha_fin: Date | string;
  id_aseguradora: number | string;
  iva: number;
  prima_neta: number;
  gastos_expedicion: number;
  beneficiario: Beneficiario | null;
  data: DatosPoliza;
  coberturas?: CoberturaAseguradora[];
  
  // Campos adicionales para la UI
  title?: string;
  code?: string;
  modifiedDate?: string;
  plant?: string;
  category?: string;
  segment?: string;
  version?: string;
  producto?: string;
}

export interface CoberturaAseguradora {
  nombre: string;
  valor: number | string;
  deducible?: string;
  descripcion?: string;
  sublimite?: string;
}

export enum TipoPoliza {
  COPROPIEDADES = 'copropiedades',
  HOGAR = 'hogar',
  VEHICULOS = 'vehiculos',
  PYME = 'pyme',
  MASCOTAS = 'mascotas',
  AP = 'ap',
  TRANSPORTES = 'transportes',
  ARRENDAMIENTO = 'arrendamiento',
  SALUD = 'salud',
  VIDA = 'vida',
  RCE = 'rce',
  ARL = 'arl'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CLIENT = 'CLIENT',
  GUEST = 'GUEST'
} 