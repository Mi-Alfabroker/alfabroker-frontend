import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-datepicker.component.html',
  styleUrls: ['./custom-datepicker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatepickerComponent),
      multi: true
    }
  ]
})
export class CustomDatepickerComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccionar fecha';
  @Input() required: boolean = false;
  @Input() invalid: boolean = false;
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  
  @Output() dateChange = new EventEmitter<Date>();
  
  isOpen: boolean = false;
  selectedDate: Date | null = null;
  displayValue: string = '';
  showAbove: boolean = false;
  
  // Calendario
  currentMonth: Date = new Date();
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  calendarDays: CalendarDay[] = [];
  availableYears: number[] = [];
  
  // Implementación de ControlValueAccessor
  onChange: any = () => {};
  onTouched: any = () => {};
  
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.generateCalendar();
    this.generateYearOptions();
  }
  
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (this.isOpen && !(event.target as HTMLElement).closest('.datepicker-container')) {
      this.isOpen = false;
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isOpen) {
      this.checkPosition();
    }
  }
  
  writeValue(value: any): void {
    if (value instanceof Date) {
      this.selectedDate = new Date(value);
      this.currentMonth = new Date(value);
    } else if (typeof value === 'string' && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        this.selectedDate = date;
        this.currentMonth = new Date(date);
      } else {
        this.selectedDate = null;
      }
    } else {
      this.selectedDate = null;
    }
    
    this.updateDisplayValue();
    this.generateCalendar();
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
  
  toggleCalendar(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.onTouched();
        this.generateCalendar();
        this.checkPosition();
      }
    }
  }
  
  checkPosition(): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const calendarHeight = 350; // Altura aproximada del calendario
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    
    // Si no hay suficiente espacio debajo, mostrar arriba
    this.showAbove = spaceBelow < calendarHeight;
  }
  
  prevMonth(event: MouseEvent): void {
    event.stopPropagation();
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }
  
  nextMonth(event: MouseEvent): void {
    event.stopPropagation();
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }
  
  changeMonth(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const month = parseInt(select.value, 10);
    this.currentMonth = new Date(this.currentMonth.getFullYear(), month, 1);
    this.generateCalendar();
    event.stopPropagation();
  }
  
  changeYear(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const year = parseInt(select.value, 10);
    this.currentMonth = new Date(year, this.currentMonth.getMonth(), 1);
    this.generateCalendar();
    event.stopPropagation();
  }
  
  selectDate(day: CalendarDay, event: MouseEvent): void {
    event.stopPropagation();
    if (day.isDisabled) return;
    
    this.selectedDate = day.date;
    this.updateDisplayValue();
    this.onChange(this.selectedDate);
    this.onTouched();
    this.dateChange.emit(this.selectedDate);
    this.isOpen = false;
    this.generateCalendar();
  }
  
  selectToday(event: MouseEvent): void {
    event.stopPropagation();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCalendarDay: CalendarDay = {
      date: today,
      day: today.getDate(),
      isCurrentMonth: true,
      isToday: true,
      isSelected: false,
      isDisabled: this.isDateDisabled(today)
    };
    
    if (!todayCalendarDay.isDisabled) {
      this.selectDate(todayCalendarDay, event);
    }
  }
  
  clearDate(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedDate = null;
    this.updateDisplayValue();
    this.onChange(this.selectedDate);
    this.onTouched();
    this.dateChange.emit(undefined);
  }
  
  private updateDisplayValue(): void {
    if (this.selectedDate) {
      const day = this.selectedDate.getDate().toString().padStart(2, '0');
      const month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = this.selectedDate.getFullYear();
      this.displayValue = `${day}/${month}/${year}`;
    } else {
      this.displayValue = '';
    }
  }
  
  private generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Primer día del mes actual
    const firstDay = new Date(year, month, 1);
    // Último día del mes actual
    const lastDay = new Date(year, month + 1, 0);
    
    // Días del mes anterior para completar la primera semana
    const daysFromPrevMonth = firstDay.getDay();
    // Días del mes siguiente para completar la última semana
    const daysFromNextMonth = 6 - lastDay.getDay();
    
    // Fecha actual para marcar el día de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.calendarDays = [];
    
    // Añadir días del mes anterior
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      const date = new Date(year, month - 1, i);
      this.calendarDays.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSelected: this.selectedDate ? date.getTime() === this.selectedDate.getTime() : false,
        isDisabled: this.isDateDisabled(date)
      });
    }
    
    // Añadir días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      this.calendarDays.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isSelected: this.selectedDate ? date.getTime() === this.selectedDate.getTime() : false,
        isDisabled: this.isDateDisabled(date)
      });
    }
    
    // Añadir días del mes siguiente
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSelected: this.selectedDate ? date.getTime() === this.selectedDate.getTime() : false,
        isDisabled: this.isDateDisabled(date)
      });
    }
  }
  
  private isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) {
      return true;
    }
    if (this.maxDate && date > this.maxDate) {
      return true;
    }
    return false;
  }
  
  // Método para formatear la fecha en formato ISO (YYYY-MM-DD) para el input nativo
  get isoDate(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toISOString().split('T')[0];
  }
  
  // Método para manejar cambios en el input nativo
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const date = new Date(input.value);
      if (!isNaN(date.getTime())) {
        this.selectedDate = date;
        this.updateDisplayValue();
        this.onChange(this.selectedDate);
        this.dateChange.emit(this.selectedDate);
        this.generateCalendar();
      }
    } else {
      this.selectedDate = null;
      this.updateDisplayValue();
      this.onChange(this.selectedDate);
      this.dateChange.emit(undefined);
    }
  }
  
  getCalendarTopPosition(): number {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const inputHeight = rect.height;
    
    if (this.showAbove) {
      // Posición del calendario encima del input (restar la altura del calendario)
      const calendarHeight = 350; // Altura aproximada del calendario
      return rect.top - calendarHeight + window.scrollY;
    } else {
      // Posición del calendario debajo del input
      return rect.top + inputHeight + window.scrollY;
    }
  }
  
  getCalendarLeftPosition(): number {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    return rect.left + window.scrollX;
  }
  
  getCalendarWidth(): number {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    // Usar el ancho del input pero con un mínimo de 260px para que el calendario sea usable
    return Math.max(rect.width, 260);
  }
  
  private generateYearOptions(): void {
    const currentYear = new Date().getFullYear();
    // Generar años desde 10 años atrás hasta 10 años adelante
    this.availableYears = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  }
}
