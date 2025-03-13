import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMessageSubject = new BehaviorSubject<string>('');

  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  loadingMessage$: Observable<string> = this.loadingMessageSubject.asObservable();

  constructor(private ngZone: NgZone) {}

  show(message: string = 'Cargando...'): void {
    // Ejecutar fuera de la zona de Angular para evitar ExpressionChangedAfterItHasBeenCheckedError
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.loadingMessageSubject.next(message);
          this.loadingSubject.next(true);
        });
      }, 0);
    });
  }

  hide(): void {
    // Ejecutar fuera de la zona de Angular para evitar ExpressionChangedAfterItHasBeenCheckedError
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.loadingSubject.next(false);
        });
      }, 0);
    });
  }
}
