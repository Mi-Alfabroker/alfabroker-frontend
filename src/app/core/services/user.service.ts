import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../store/auth/auth.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/v1/auth/users`;

  constructor(private http: HttpClient) { }

  // Obtener un usuario por ID
  getUserById(id: number): Observable<User | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        // Verificar si la respuesta tiene la estructura esperada con 'data'
        const user = response.data || response;
        return user;
      }),
      catchError(error => {
        console.error(`Error al obtener el usuario con ID ${id}:`, error);
        return of(null);
      })
    );
  }

  // Obtener todos los usuarios
  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        // Verificar si la respuesta tiene la estructura esperada con 'data'
        const users = response.data || response;
        return users;
      }),
      catchError(error => {
        console.error('Error al obtener los usuarios:', error);
        return of([]);
      })
    );
  }
} 