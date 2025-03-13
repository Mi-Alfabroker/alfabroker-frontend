import { Component, Input, Output, EventEmitter, Type, ViewChild, ViewContainerRef, ComponentRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'auto' = 'md';
  @Input() component: Type<any> | null = null;
  @Input() componentInputs: { [key: string]: any } = {};
  @Output() close = new EventEmitter<void>();
  @Output() componentOutput = new EventEmitter<any>();
  
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;
  
  private componentRef: ComponentRef<any> | null = null;
  private windowWidth: number = window.innerWidth;
  private scrollPosition: number = 0;
  
  constructor() {}
  
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowWidth = window.innerWidth;
  }
  
  ngOnInit(): void {
    this.loadComponent();
    this.windowWidth = window.innerWidth;
    
    // Guardar la posición de desplazamiento actual
    this.scrollPosition = window.scrollY;
    
    // Prevenir el scroll del body cuando el modal está abierto
    document.body.classList.add('modal-open');
    document.body.style.top = `-${this.scrollPosition}px`;
  }
  
  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    
    // Restaurar el scroll del body cuando el modal se cierra
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('top');
    window.scrollTo(0, this.scrollPosition);
  }
  
  loadComponent(): void {
    if (!this.component) {
      return;
    }
    
    this.container.clear();
    this.componentRef = this.container.createComponent(this.component);
    
    // Pasar inputs al componente
    Object.keys(this.componentInputs).forEach(key => {
      this.componentRef!.instance[key] = this.componentInputs[key];
    });
    
    // Escuchar outputs del componente
    if (this.componentRef.instance.output) {
      this.componentRef.instance.output.subscribe((data: any) => {
        this.componentOutput.emit(data);
      });
    }
    
    // Escuchar evento de cierre del componente
    if (this.componentRef.instance.closeModal) {
      this.componentRef.instance.closeModal.subscribe(() => {
        this.closeModal();
      });
    }
  }
  
  closeModal(): void {
    this.close.emit();
  }
  
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
  
  getSizeClass(): string {
    if (this.windowWidth < 640) {
      return 'max-w-full';
    }
    
    switch (this.size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-xl';
      case 'lg': return 'max-w-3xl';
      case 'xl': return 'max-w-4xl';
      case '2xl': return 'max-w-5xl';
      case '3xl': return 'max-w-6xl';
      case '4xl': return 'max-w-7xl';
      case '5xl': return 'w-[90%] max-w-[1400px]';
      case '6xl': return 'w-[95%] max-w-[1600px]';
      case '7xl': return 'w-[98%] max-w-[1800px]';
      case 'auto': 
        if (this.windowWidth < 768) return 'max-w-xl';
        if (this.windowWidth < 1024) return 'max-w-3xl';
        if (this.windowWidth < 1280) return 'max-w-4xl';
        return 'max-w-5xl';
      default: return 'max-w-xl';
    }
  }
} 