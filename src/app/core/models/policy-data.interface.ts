// Interfaz para beneficiarios
export interface Beneficiario {
  nombre: string;
  identificacion: string;
  parentesco: string;
}

// Interfaz para datos de vehículos
export interface DatosVehiculo {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cod_fasecolda: string;
  valor_accesorios: number;
  valor_vehiculo: number;
  cilindraje: number;
  tipo_uso: string;
  tipo_vehiculo: string;
}

// Interfaz para datos de hogar
export interface DatosHogar {
  nombre: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  tipo_inmueble: string;
  num_pisos: number;
  ano_construccion: number;
  valor_inmueble: number;
  valor_contenidos_normales: number;
  valor_equipos_electronicos: number;
  valor_contenidos_especiales: number;
}

// Interfaz para miembros del consejo de copropiedad
export interface ConsejoMiembro {
  nombre: string;
  telefono: string;
}

// Interfaz para datos de copropiedad
export interface DatosCopropiedad {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  nombre_responsable: string;
  telefono_responsable: string;
  ano_construccion: number;
  estrato: number;
  num_torres: number;
  num_pisos: number;
  num_casas: number;
  num_aptos: number;
  num_sotanos: number;
  valor_edificio_area_comun: number;
  valor_muebles: number;
  valor_edificio_area_privada: number;
  valor_dinero: number;
  valor_maquinaria: number;
  valor_rce: number;
  valor_eee: number;
  valor_da: number;
  tvalores_anual: number;
  tvalores_despacho: number;
  valor_manejo: number;
  consejo: ConsejoMiembro[];
  tipo_copropiedad: string;
  num_locales: number;
}

// Interfaz para cobertura general
export interface Cobertura {
  nombre: string;
  valor: string;
  deducible: string;
}

// Interfaz para datos generales
export interface DatosGeneral {
  subtipo: string;
  bien_asegurable: string;
  cobertura?: Cobertura[];
}

// Tipo unión para todos los tipos de datos de póliza
export type DatosPoliza = 
  | DatosCopropiedad
  | DatosVehiculo
  | DatosHogar
  | DatosGeneral
  | null
  | undefined; 