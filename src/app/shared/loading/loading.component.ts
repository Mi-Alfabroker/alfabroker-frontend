import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html'
})
export class LoadingComponent implements OnChanges {
  @Input() isLoading: boolean | null = false;
  @Input() message: string | null = 'Cargando...';
  
  actualIsLoading: boolean = false;
  actualMessage: string = 'Cargando...';
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLoading']) {
      this.actualIsLoading = !!this.isLoading;
    }
    
    if (changes['message']) {
      this.actualMessage = this.message || 'Cargando...';
    }
  }
}
