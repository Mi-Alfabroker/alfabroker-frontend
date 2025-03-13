export interface Client {
  id: number | string;
  name: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: Date | string;
  policies?: string[] | number[]; // IDs de las pólizas asociadas
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export enum DocumentType {
  CC = 'CC',      // Cédula de Ciudadanía
  CE = 'CE',      // Cédula de Extranjería
  NIT = 'NIT',    // Número de Identificación Tributaria
  PP = 'PP',      // Pasaporte
  TI = 'TI',      // Tarjeta de Identidad
  OTHER = 'OTHER' // Otro
} 