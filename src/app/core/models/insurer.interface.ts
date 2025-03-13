export interface Insurer {
  id: number | string;
  name: string;
  code: string;
  nit: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  logo?: string;
  active: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface InsurerProduct {
  id: number | string;
  insurerId: number | string;
  name: string;
  code: string;
  description?: string;
  policyType: string;
  coverages?: string[] | number[]; // IDs de las coberturas disponibles
  active: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
} 