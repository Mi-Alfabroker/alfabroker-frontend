import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Seleccionar...';
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() invalid: boolean = false;
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  
  @Output() selectionChange = new EventEmitter<any>();
  
  isOpen: boolean = false;
  selectedValue: any = null;
  selectedLabel: string = '';
  
  private selectElement: HTMLElement;
  
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.selectElement = this.elementRef.nativeElement;
  }
  
  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouched: any = () => {};
  
  writeValue(value: any): void {
    this.selectedValue = value;
    this.updateSelectedLabel();
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  
  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.onTouched();
      }
    }
  }
  
  closeDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = false;
  }
  
  selectOption(option: SelectOption, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.onChange(this.selectedValue);
    this.onTouched();
    this.selectionChange.emit(this.selectedValue);
    this.isOpen = false;
  }
  
  private updateSelectedLabel(): void {
    const selectedOption = this.options.find(option => option.value === this.selectedValue);
    this.selectedLabel = selectedOption ? selectedOption.label : '';
  }
  
  getDropdownTopPosition(): number {
    if (!this.selectElement) return 0;
    
    const rect = this.selectElement.getBoundingClientRect();
    const selectHeight = rect.height;
    
    // Posición del dropdown debajo del select
    return rect.top + selectHeight + window.scrollY;
  }
  
  getDropdownLeftPosition(): number {
    if (!this.selectElement) return 0;
    
    const rect = this.selectElement.getBoundingClientRect();
    return rect.left + window.scrollX;
  }
  
  getDropdownWidth(): number {
    if (!this.selectElement) return 200;
    
    const rect = this.selectElement.getBoundingClientRect();
    return rect.width;
  }
}
