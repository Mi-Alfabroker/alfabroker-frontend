import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Policy, TipoPoliza, DatosPoliza, Beneficiario, CoberturaAseguradora } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private apiUrl = `${environment.apiUrl}/api/v1/polizas`;

  constructor(private http: HttpClient) { }

  // Obtener el ID del usuario actual desde localStorage
  private getCurrentUserId(): number | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // Decodificar el token JWT
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const tokenData = JSON.parse(window.atob(base64));
      
      return tokenData.id || null;
    } catch (error) {
      console.error('Error al obtener el ID del usuario:', error);
      return null;
    }
  }

  // Obtener todas las pólizas (solo admin)
  getAllPolicies(): Observable<Policy[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        // Verificar si la respuesta tiene la estructura esperada con 'data'
        const policies = response.data || response;
        return this.mapPoliciesToUI(policies);
      }),
      catchError(error => {
        console.error('Error al obtener las pólizas:', error);
        return of([]);
      })
    );
  }

  // Obtener pólizas por usuario
  getPoliciesByUser(userId?: number): Observable<Policy[]> {
    // Si no se proporciona un ID de usuario, usar el ID del usuario actual
    const id = userId || this.getCurrentUserId();
    
    // Si aún no hay ID de usuario, usar la ruta sin ID
    const url = id ? `${this.apiUrl}/user/${id}` : `${this.apiUrl}/user`;
    
    console.log('URL de pólizas:', url, 'ID de usuario:', id);
    
    return this.http.get<any>(url).pipe(
      map(response => {
        // Verificar si la respuesta tiene la estructura esperada con 'data'
        const policies = response.data || response;
        console.log('Pólizas recibidas:', policies);
        return this.mapPoliciesToUI(policies);
      }),
      catchError(error => {
        console.error('Error al obtener las pólizas del usuario:', error);
        return of([]);
      })
    );
  }

  // Obtener una póliza por ID
  getPolicyById(id: number): Observable<Policy | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        // Verificar si la respuesta tiene la estructura esperada con 'data'
        const policy = response.data || response;
        return this.mapPolicyToUI(policy);
      }),
      catchError(error => {
        console.error(`Error al obtener la póliza con ID ${id}:`, error);
        return of(null);
      })
    );
  }

  // Crear una nueva póliza
  createPolicy(policy: any): Observable<Policy | null> {
    return this.http.post<any>(this.apiUrl, policy).pipe(
      map(response => this.mapPolicyToUI(response)),
      catchError(error => {
        console.error('Error al crear la póliza:', error);
        return of(null);
      })
    );
  }

  // Actualizar una póliza
  updatePolicy(id: number, policy: Policy): Observable<Policy | null> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, this.mapPolicyToAPI(policy)).pipe(
      map(response => this.mapPolicyToUI(response)),
      catchError(error => {
        console.error(`Error al actualizar la póliza con ID ${id}:`, error);
        return of(null);
      })
    );
  }

  // Eliminar una póliza
  deletePolicy(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error al eliminar la póliza con ID ${id}:`, error);
        return of(false);
      })
    );
  }

  // Mapear las pólizas del API al formato de la UI
  private mapPoliciesToUI(policies: any[]): Policy[] {
    if (!policies || !Array.isArray(policies)) {
      console.warn('No se recibieron pólizas válidas del API');
      return [];
    }
    
    try {
      return policies.map(policy => this.mapPolicyToUI(policy));
    } catch (error) {
      console.error('Error al mapear las pólizas:', error);
      return [];
    }
  }

  // Mapear una póliza del API al formato de la UI
  private mapPolicyToUI(policy: any): Policy {
    if (!policy) {
      console.warn('Se intentó mapear una póliza nula o indefinida');
      return {} as Policy;
    }

    try {
      // Extraer datos específicos según el tipo de póliza
      const data = policy.data || {};
      
      // Crear campos adicionales para la UI
      let title = '';
      let category = '';
      
      switch (policy.tipo_poliza) {
        case TipoPoliza.VEHICULOS:
          title = `Seguro de Vehículo ${data.marca || ''} ${data.modelo || ''}`;
          category = 'Seguro Vehicular';
          break;
        case TipoPoliza.HOGAR:
          title = `Seguro de Hogar ${data.direccion || ''}`;
          category = 'Seguro de Hogar';
          break;
        case TipoPoliza.COPROPIEDADES:
          title = `Seguro de Copropiedad ${data.nombre || ''}`;
          category = 'Seguro de Copropiedad';
          break;
        case TipoPoliza.VIDA:
          title = `Seguro de Vida`;
          category = 'Seguro de Vida';
          break;
        case TipoPoliza.SALUD:
          title = `Seguro de Salud`;
          category = 'Seguro de Salud';
          break;
        default:
          title = `Póliza #${policy.id || 'Nueva'}`;
          category = `Seguro de ${policy.tipo_poliza || 'General'}`;
      }

      // Crear un código para la póliza
      const policyId = policy.id ? policy.id.toString() : '000000';
      const policyType = policy.tipo_poliza ? policy.tipo_poliza.substring(0, 1).toUpperCase() : 'X';
      const code = `POL-${policyType}-${policyId.padStart(6, '0')}`;
      
      // Formatear la fecha de creación
      const createdAt = policy.fecha_creacion ? new Date(policy.fecha_creacion) : new Date();
      const modifiedDate = createdAt.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Obtener el nombre del cliente/beneficiario
      const segment = policy.beneficiario?.nombre || data.nombre_responsable || 'Cliente';

      // Obtener el nombre de la aseguradora (en una aplicación real, esto vendría de una tabla de aseguradoras)
      const plant = `Aseguradora ID: ${policy.id_aseguradora || 'N/A'}`;

      return {
        ...policy,
        title,
        code,
        modifiedDate,
        plant,
        category,
        segment,
        version: '1'
      };
    } catch (error) {
      console.error('Error al mapear la póliza:', error, policy);
      return {
        id: policy.id || 0,
        title: `Póliza #${policy.id || 'Error'}`,
        code: 'POL-ERR-000000',
        modifiedDate: new Date().toLocaleDateString(),
        plant: 'Error',
        category: 'Error',
        segment: 'Error',
        version: '1',
        ...policy
      };
    }
  }

  // Mapear una póliza de la UI al formato del API
  private mapPolicyToAPI(policy: Policy): any {
    // Extraer solo los campos que el API espera
    const apiPolicy = {
      id_user: policy.id_user,
      tipo_poliza: policy.tipo_poliza,
      fecha_inicio: policy.fecha_inicio,
      fecha_fin: policy.fecha_fin,
      id_aseguradora: policy.id_aseguradora,
      iva: policy.iva,
      prima_neta: policy.prima_neta,
      gastos_expedicion: policy.gastos_expedicion,
      beneficiario: policy.beneficiario,
      data: policy.data,
      coberturas: policy.coberturas
    };

    return apiPolicy;
  }

  // Obtener todas las aseguradoras
  getAseguradoras(): Observable<any[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/v1/aseguradoras`).pipe(
      map(response => {
        // Verificar si la respuesta tiene la estructura esperada con 'data'
        const aseguradoras = response.data || response;
        return aseguradoras;
      }),
      catchError(error => {
        console.error('Error al obtener las aseguradoras:', error);
        return of([]);
      })
    );
  }
}
