import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { PolicyService } from '../../../core/services/policy.service';
import { LoadingService } from '../../../core/services/loading.service';
import { TipoPoliza, Policy } from '../../../core/models';
import { finalize } from 'rxjs';
import { CustomSelectComponent, SelectOption } from '../../../shared/custom-select/custom-select.component';
import { CustomDatepickerComponent } from '../../../shared/custom-datepicker/custom-datepicker.component';

interface CoberturaOption {
  id: string;
  nombre: string;
  descripcion: string;
  valor: number | string;
  deducible: string;
  sublimite: string;
  tipoPoliza?: TipoPoliza[];
}

interface Aseguradora {
  id: number;
  nombre: string;
  telefono: string;
  cobertura: CoberturaOption[];
}

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    CustomSelectComponent,
    CustomDatepickerComponent
  ],
  templateUrl: './policy-form.component.html',
  styleUrl: './policy-form.component.css'
})
export class PolicyFormComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() output = new EventEmitter<Policy>();
  
  policyForm: FormGroup;
  tipoPolizaOptions = Object.values(TipoPoliza);
  currentStep = 1;
  totalSteps = 3;
  error: string | null = null;
  aseguradoras: Aseguradora[] = [];
  selectedAseguradora: Aseguradora | null = null;
  isSubmitting = false;
  
  // Coberturas filtradas según el tipo de póliza seleccionado y la aseguradora
  filteredCoberturas: CoberturaOption[] = [];
  
  // Opciones para los selectores
  get coberturasSelectOptions(): SelectOption[] {
    return this.filteredCoberturas.map(c => ({ value: c.id, label: c.nombre }));
  }
  
  tipoPolizaSelectOptions: SelectOption[] = [];
  aseguradoraSelectOptions: SelectOption[] = [];
  tipoVehiculoOptions: SelectOption[] = [
    { value: 'automovil', label: 'Automóvil' },
    { value: 'camioneta', label: 'Camioneta' },
    { value: 'motocicleta', label: 'Motocicleta' },
    { value: 'camion', label: 'Camión' }
  ];
  tipoUsoOptions: SelectOption[] = [
    { value: 'particular', label: 'Particular' },
    { value: 'publico', label: 'Público' },
    { value: 'comercial', label: 'Comercial' }
  ];
  tipoCopropiedadOptions: SelectOption[] = [
    { value: 'residencial', label: 'Residencial' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'mixto', label: 'Mixto' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private loadingService: LoadingService
  ) {
    // Inicializar el formulario en el constructor para evitar el error
    this.policyForm = this.fb.group({
      // Paso 1: Información básica
      tipo_poliza: [TipoPoliza.VEHICULOS, Validators.required],
      fecha_inicio: [this.formatDate(new Date()), Validators.required],
      fecha_fin: [this.formatDate(this.addOneYear(new Date())), Validators.required],
      id_aseguradora: [null, Validators.required],
      
      // Paso 2: Información financiera
      prima_neta: ['', [Validators.required, Validators.min(0), this.numberOnlyValidator()]],
      iva: ['', [Validators.required, Validators.min(0), this.numberOnlyValidator()]],
      gastos_expedicion: ['', [Validators.required, Validators.min(0), this.numberOnlyValidator()]],
      
      // Paso 3: Información específica según tipo de póliza
      beneficiario: this.fb.group({
        nombre: [''],
        identificacion: [''],
        parentesco: ['']
      }),
      
      // Datos específicos según tipo de póliza
      data: this.fb.group({}),
      
      // Coberturas
      coberturas: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadingService.show('Cargando formulario...');
    
    // Convertir opciones de tipo de póliza para el selector personalizado
    this.tipoPolizaSelectOptions = this.tipoPolizaOptions.map(tipo => ({
      value: tipo,
      label: this.capitalizeFirstLetter(tipo)
    }));
    
    // Cargar aseguradoras
    this.loadAseguradoras();
    
    // Escuchar cambios en el tipo de póliza para actualizar el formulario
    this.policyForm.get('tipo_poliza')?.valueChanges.subscribe(tipo => {
      this.updateDataFormGroup(tipo);
      this.filterCoberturas();
    });
    
    // Escuchar cambios en la aseguradora seleccionada
    this.policyForm.get('id_aseguradora')?.valueChanges.subscribe(id => {
      if (id) {
        this.onAseguradoraChange(Number(id));
      } else {
        this.selectedAseguradora = null;
        this.filterCoberturas();
      }
    });
    
    // Inicializar el formulario con el tipo de póliza seleccionado
    this.updateDataFormGroup(this.policyForm.get('tipo_poliza')?.value);
  }

  loadAseguradoras(): void {
    // Método temporal hasta que implementemos el servicio real
    // En una implementación real, llamaríamos a un método del servicio
    setTimeout(() => {
      this.aseguradoras = [
        { 
          id: 1, 
          nombre: 'Seguros Alfa', 
          telefono: '6013123456',
          cobertura: [
            {
              id: 'incendio-alfa',
              nombre: 'Incendio y Aliadas',
              descripcion: 'Cubre daños por incendio y eventos naturales',
              valor: 100000000,
              deducible: '2% del valor asegurado',
              sublimite: 'Hasta el valor asegurado'
            },
            {
              id: 'rce-alfa',
              nombre: 'Responsabilidad Civil Extracontractual',
              descripcion: 'Cubre daños a terceros',
              valor: 50000000,
              deducible: '5% del valor del siniestro',
              sublimite: 'Hasta el valor asegurado'
            },
            {
              id: 'terremoto-alfa',
              nombre: 'Terremoto, temblor, erupción volcánica',
              descripcion: 'Cobertura por daños causados por eventos sísmicos',
              valor: 200000000,
              deducible: '3% del valor asegurable, mínimo 5 SMMLV',
              sublimite: 'Hasta el valor asegurado'
            }
          ]
        },
        { 
          id: 2, 
          nombre: 'Seguros Bolívar', 
          telefono: '6014567890',
          cobertura: [
            {
              id: 'perdida-total-bolivar',
              nombre: 'Pérdida Total',
              descripcion: 'Cubre pérdida total por daños o hurto',
              valor: 100000000,
              deducible: '10% del valor del siniestro',
              sublimite: 'Hasta el valor asegurado'
            },
            {
              id: 'perdida-parcial-bolivar',
              nombre: 'Pérdida Parcial',
              descripcion: 'Cubre pérdida parcial por daños o hurto',
              valor: 50000000,
              deducible: '10% del valor del siniestro',
              sublimite: 'Hasta el valor asegurado'
            }
          ]
        },
        { 
          id: 3, 
          nombre: 'Mapfre Seguros', 
          telefono: '6017890123',
          cobertura: [
            {
              id: 'danos-agua-mapfre',
              nombre: 'Daños por Agua',
              descripcion: 'Cubre daños por agua en el hogar',
              valor: 80000000,
              deducible: '3% del valor del siniestro',
              sublimite: 'Hasta el valor asegurado'
            },
            {
              id: 'robo-mapfre',
              nombre: 'Robo',
              descripcion: 'Cubre robo de contenidos',
              valor: 60000000,
              deducible: '5% del valor del siniestro',
              sublimite: 'Hasta el valor asegurado'
            }
          ]
        }
      ];
      
      // Convertir aseguradoras para el selector personalizado
      this.aseguradoraSelectOptions = this.aseguradoras.map(aseguradora => ({
        value: aseguradora.id,
        label: aseguradora.nombre
      }));
      
      this.loadingService.hide();
    }, 500);
  }

  onAseguradoraChange(id: number): void {
    this.selectedAseguradora = this.aseguradoras.find(a => a.id === id) || null;
    
    // Limpiar las coberturas existentes
    while (this.coberturasArray.length) {
      this.coberturasArray.removeAt(0);
    }
    
    this.filterCoberturas();
  }

  updateDataFormGroup(tipo: TipoPoliza): void {
    const dataGroup = this.policyForm.get('data') as FormGroup;
    
    // Limpiar el grupo actual
    Object.keys(dataGroup.controls).forEach(key => {
      dataGroup.removeControl(key);
    });
    
    // Añadir controles según el tipo de póliza
    switch (tipo) {
      case TipoPoliza.VEHICULOS:
        dataGroup.addControl('placa', this.fb.control('', Validators.required));
        dataGroup.addControl('marca', this.fb.control('', Validators.required));
        dataGroup.addControl('modelo', this.fb.control('', Validators.required));
        dataGroup.addControl('ano', this.fb.control(new Date().getFullYear().toString(), [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('tipo_vehiculo', this.fb.control('automovil', Validators.required));
        dataGroup.addControl('tipo_uso', this.fb.control('particular', Validators.required));
        dataGroup.addControl('cilindraje', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('cod_fasecolda', this.fb.control(''));
        dataGroup.addControl('valor_vehiculo', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('valor_accesorios', this.fb.control('', this.numberOnlyValidator()));
        break;
        
      case TipoPoliza.HOGAR:
        dataGroup.addControl('nombre', this.fb.control('', Validators.required));
        dataGroup.addControl('telefono', this.fb.control('', Validators.required));
        dataGroup.addControl('direccion', this.fb.control('', Validators.required));
        dataGroup.addControl('ciudad', this.fb.control('', Validators.required));
        dataGroup.addControl('tipo_inmueble', this.fb.control('casa', Validators.required));
        dataGroup.addControl('num_pisos', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('ano_construccion', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('valor_inmueble', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('valor_contenidos_normales', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('valor_equipos_electronicos', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('valor_contenidos_especiales', this.fb.control('', this.numberOnlyValidator()));
        break;
        
      case TipoPoliza.COPROPIEDADES:
        dataGroup.addControl('nombre', this.fb.control('', Validators.required));
        dataGroup.addControl('direccion', this.fb.control('', Validators.required));
        dataGroup.addControl('telefono', this.fb.control('', Validators.required));
        dataGroup.addControl('email', this.fb.control('', [Validators.required, Validators.email]));
        dataGroup.addControl('estrato', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('tipo_copropiedad', this.fb.control('residencial', Validators.required));
        dataGroup.addControl('ano_construccion', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('num_torres', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('num_pisos', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('num_aptos', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('num_casas', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('num_locales', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('num_sotanos', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('valor_edificio_area_comun', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('valor_edificio_area_privada', this.fb.control('', [Validators.required, this.numberOnlyValidator()]));
        dataGroup.addControl('valor_muebles', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('valor_maquinaria', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('valor_dinero', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('valor_manejo', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('valor_rce', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('valor_da', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('valor_eee', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('tvalores_anual', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('tvalores_despacho', this.fb.control('', this.numberOnlyValidator()));
        dataGroup.addControl('nombre_responsable', this.fb.control('', Validators.required));
        dataGroup.addControl('telefono_responsable', this.fb.control('', Validators.required));
        dataGroup.addControl('consejo', this.fb.array([]));
        
        // Añadir un consejero por defecto
        this.addConsejero();
        break;
        
      case TipoPoliza.VIDA:
        dataGroup.addControl('subtipo', this.fb.control('Vida Individual', Validators.required));
        dataGroup.addControl('bien_asegurable', this.fb.control('Vida', Validators.required));
        break;
        
      default:
        // Para otros tipos de póliza
        dataGroup.addControl('subtipo', this.fb.control('General', Validators.required));
        dataGroup.addControl('bien_asegurable', this.fb.control('General', Validators.required));
        break;
    }
  }

  filterCoberturas(): void {
    // Limpiar las coberturas filtradas
    this.filteredCoberturas = [];
    
    if (!this.selectedAseguradora) {
      return;
    }
    
    const tipoPoliza = this.policyForm.get('tipo_poliza')?.value;
    
    // Filtrar las coberturas de la aseguradora seleccionada
    this.filteredCoberturas = this.selectedAseguradora.cobertura;
  }

  get coberturasArray(): FormArray {
    return this.policyForm.get('coberturas') as FormArray;
  }

  get consejoArray(): FormArray {
    const dataGroup = this.policyForm.get('data') as FormGroup;
    return dataGroup.get('consejo') as FormArray;
  }

  addCobertura(coberturaOption: CoberturaOption): void {
    this.coberturasArray.push(this.fb.group({
      nombre: [coberturaOption.nombre, Validators.required],
      descripcion: [coberturaOption.descripcion],
      valor: [coberturaOption.valor, [Validators.required, this.numberOnlyValidator()]],
      deducible: [coberturaOption.deducible || ''],
      sublimite: [coberturaOption.sublimite || '']
    }));
  }

  removeCobertura(index: number): void {
    this.coberturasArray.removeAt(index);
  }

  addCoberturaFromSelect(coberturaId: string): void {
    if (!coberturaId || !this.selectedAseguradora) return;
    
    const coberturaOption = this.selectedAseguradora.cobertura.find(c => c.id === coberturaId);
    if (coberturaOption) {
      // Verificar si ya existe esta cobertura
      const existingIndex = this.coberturasArray.controls.findIndex(
        control => control.get('nombre')?.value === coberturaOption.nombre
      );
      
      if (existingIndex === -1) {
        this.addCobertura(coberturaOption);
      } else {
        this.error = `La cobertura "${coberturaOption.nombre}" ya ha sido agregada.`;
        setTimeout(() => this.error = null, 3000);
      }
    }
  }

  addConsejero(): void {
    if (this.policyForm.get('tipo_poliza')?.value === TipoPoliza.COPROPIEDADES) {
      this.consejoArray.push(this.fb.group({
        nombre: ['', Validators.required],
        telefono: ['', Validators.required]
      }));
    }
  }

  removeConsejero(index: number): void {
    this.consejoArray.removeAt(index);
  }

  nextStep(): void {
    // Validar el paso actual antes de avanzar
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    let isValid = true;
    const form = this.policyForm;
    
    switch (this.currentStep) {
      case 1:
        // Validar campos del paso 1
        ['tipo_poliza', 'fecha_inicio', 'fecha_fin', 'id_aseguradora'].forEach(field => {
          const control = form.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            isValid = false;
          }
        });
        break;
        
      case 2:
        // Validar campos del paso 2
        ['prima_neta', 'iva', 'gastos_expedicion'].forEach(field => {
          const control = form.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            isValid = false;
          }
        });
        break;
        
      case 3:
        // Validar campos del paso 3 según el tipo de póliza
        const dataGroup = form.get('data') as FormGroup;
        
        // Solo validar los campos requeridos según el tipo de póliza
        const tipoPoliza = form.get('tipo_poliza')?.value;
        let camposRequeridos: string[] = [];
        
        if (tipoPoliza === TipoPoliza.VEHICULOS) {
          camposRequeridos = ['placa', 'marca', 'modelo', 'ano', 'tipo_vehiculo', 'tipo_uso', 'cilindraje', 'valor_vehiculo'];
        } else if (tipoPoliza === TipoPoliza.HOGAR) {
          camposRequeridos = ['nombre', 'telefono', 'direccion', 'ciudad', 'tipo_inmueble', 'num_pisos', 'ano_construccion', 'valor_inmueble'];
        } else if (tipoPoliza === TipoPoliza.COPROPIEDADES) {
          camposRequeridos = [
            'nombre', 'direccion', 'telefono', 'email', 'estrato', 'tipo_copropiedad',
            'ano_construccion', 'num_torres', 'num_pisos', 'num_aptos',
            'valor_edificio_area_comun', 'valor_edificio_area_privada',
            'nombre_responsable', 'telefono_responsable'
          ];
        } else if (tipoPoliza === TipoPoliza.VIDA) {
          camposRequeridos = ['subtipo', 'bien_asegurable'];
        }
        
        // Validar solo los campos requeridos
        camposRequeridos.forEach(field => {
          const control = dataGroup.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            isValid = false;
          }
        });
        
        // Validar que haya al menos una cobertura
        if (this.coberturasArray.length === 0) {
          this.error = 'Debe agregar al menos una cobertura';
          isValid = false;
        } else {
          // Validar cada cobertura
          for (let i = 0; i < this.coberturasArray.length; i++) {
            const cobertura = this.coberturasArray.at(i) as FormGroup;
            if (cobertura.invalid) {
              Object.keys(cobertura.controls).forEach(key => {
                const control = cobertura.get(key);
                if (control?.invalid) {
                  control.markAsTouched();
                }
              });
              isValid = false;
            }
          }
        }
        break;
    }
    
    if (!isValid) {
      this.error = 'Por favor, complete todos los campos requeridos.';
    } else {
      this.error = null;
    }
    
    return isValid;
  }

  onSubmit(): void {
    // Validar todos los pasos antes de enviar
    let isValid = true;
    
    // Guardar el paso actual
    const currentStepBackup = this.currentStep;
    
    // Validar paso 1
    this.currentStep = 1;
    if (!this.validateCurrentStep()) {
      isValid = false;
    }
    
    // Validar paso 2
    this.currentStep = 2;
    if (!this.validateCurrentStep()) {
      isValid = false;
    }
    
    // Validar paso 3
    this.currentStep = 3;
    if (!this.validateCurrentStep()) {
      isValid = false;
    }
    
    // Restaurar el paso actual
    this.currentStep = currentStepBackup;
    
    if (!isValid) {
      this.error = 'Por favor, completa todos los campos requeridos en todos los pasos.';
      return;
    }
    
    this.error = null;
    this.isSubmitting = true;
    this.loadingService.show('Guardando póliza...');
    
    const formValue = this.policyForm.value;
    
    // Convertir campos a tipo numérico
    formValue.id_aseguradora = Number(formValue.id_aseguradora);
    formValue.prima_neta = Number(formValue.prima_neta);
    formValue.iva = Number(formValue.iva);
    formValue.gastos_expedicion = Number(formValue.gastos_expedicion);
    
    // Convertir campos numéricos en el objeto data según el tipo de póliza
    if (formValue.data) {
      const tipoPoliza = formValue.tipo_poliza;
      
      if (tipoPoliza === TipoPoliza.VEHICULOS) {
        formValue.data.ano = Number(formValue.data.ano);
        formValue.data.cilindraje = Number(formValue.data.cilindraje);
        formValue.data.valor_vehiculo = Number(formValue.data.valor_vehiculo);
        formValue.data.valor_accesorios = Number(formValue.data.valor_accesorios || 0);
      } else if (tipoPoliza === TipoPoliza.HOGAR) {
        formValue.data.num_pisos = Number(formValue.data.num_pisos);
        formValue.data.ano_construccion = Number(formValue.data.ano_construccion);
        formValue.data.valor_inmueble = Number(formValue.data.valor_inmueble);
        formValue.data.valor_contenidos_normales = Number(formValue.data.valor_contenidos_normales || 0);
        formValue.data.valor_equipos_electronicos = Number(formValue.data.valor_equipos_electronicos || 0);
        formValue.data.valor_contenidos_especiales = Number(formValue.data.valor_contenidos_especiales || 0);
      } else if (tipoPoliza === TipoPoliza.COPROPIEDADES) {
        formValue.data.estrato = Number(formValue.data.estrato);
        formValue.data.ano_construccion = Number(formValue.data.ano_construccion);
        formValue.data.num_torres = Number(formValue.data.num_torres);
        formValue.data.num_pisos = Number(formValue.data.num_pisos);
        formValue.data.num_aptos = Number(formValue.data.num_aptos);
        formValue.data.num_casas = Number(formValue.data.num_casas || 0);
        formValue.data.num_locales = Number(formValue.data.num_locales || 0);
        formValue.data.num_sotanos = Number(formValue.data.num_sotanos || 0);
        formValue.data.valor_edificio_area_comun = Number(formValue.data.valor_edificio_area_comun);
        formValue.data.valor_edificio_area_privada = Number(formValue.data.valor_edificio_area_privada);
        formValue.data.valor_muebles = Number(formValue.data.valor_muebles || 0);
        formValue.data.valor_maquinaria = Number(formValue.data.valor_maquinaria || 0);
        formValue.data.valor_dinero = Number(formValue.data.valor_dinero || 0);
        formValue.data.valor_manejo = Number(formValue.data.valor_manejo || 0);
        formValue.data.valor_rce = Number(formValue.data.valor_rce || 0);
        formValue.data.valor_da = Number(formValue.data.valor_da || 0);
        formValue.data.valor_eee = Number(formValue.data.valor_eee || 0);
        formValue.data.tvalores_anual = Number(formValue.data.tvalores_anual || 0);
        formValue.data.tvalores_despacho = Number(formValue.data.tvalores_despacho || 0);
      }
    }
    
    // Procesar las coberturas correctamente
    if (formValue.coberturas && formValue.coberturas.length > 0) {
      formValue.coberturas = formValue.coberturas.map((cobertura: any) => {
        return {
          nombre: cobertura.nombre,
          descripcion: cobertura.descripcion,
          valor: Number(cobertura.valor),
          deducible: cobertura.deducible || '',
          sublimite: cobertura.sublimite || ''
        };
      });
    }
    
    // Si el beneficiario está vacío, establecerlo como null
    if (!formValue.beneficiario.nombre && !formValue.beneficiario.identificacion) {
      formValue.beneficiario = null;
    }
    
    // Obtener el ID del usuario actual desde el token JWT
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const tokenData = JSON.parse(window.atob(base64));
        formValue.id_user = tokenData.id;
      } else {
        this.error = 'No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.';
        this.loadingService.hide();
        return;
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      this.error = 'Error al obtener la información del usuario. Por favor, inicia sesión nuevamente.';
      this.loadingService.hide();
      return;
    }
    
    console.log('Enviando formulario:', formValue);
    
    // Preparar el objeto para enviar al backend según el formato esperado
    const apiPoliza: any = {
      tipo_poliza: formValue.tipo_poliza,
      fecha_inicio: formValue.fecha_inicio,
      fecha_fin: formValue.fecha_fin,
      id_aseguradora: Number(formValue.id_aseguradora),
      prima_neta: formValue.prima_neta,
      iva: formValue.iva,
      gastos_expedicion: formValue.gastos_expedicion,
      id_user: formValue.id_user,
      beneficiario: formValue.beneficiario,
      coberturas: formValue.coberturas
    };
    
    // Añadir los datos específicos según el tipo de póliza
    switch (formValue.tipo_poliza) {
      case TipoPoliza.VEHICULOS:
        apiPoliza.data_vehiculo = formValue.data;
        break;
      case TipoPoliza.HOGAR:
        apiPoliza.data_hogar = formValue.data;
        break;
      case TipoPoliza.COPROPIEDADES:
        apiPoliza.data_copropiedad = formValue.data;
        break;
      default:
        apiPoliza.data_general = formValue.data;
        break;
    }
    
    console.log('Enviando al API:', apiPoliza);
    
    this.policyService.createPolicy(apiPoliza)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (policy) => {
          if (policy) {
            this.output.emit(policy);
            this.closeModal.emit();
          } else {
            this.error = 'No se pudo crear la póliza. Por favor, inténtalo de nuevo más tarde.';
          }
        },
        error: (err) => {
          console.error('Error al crear la póliza:', err);
          this.error = 'Error al crear la póliza: ' + (err.error?.message || err.error?.rawErrors?.join(', ') || 'Error desconocido');
        }
      });
  }

  cancel(): void {
    this.closeModal.emit();
  }

  // Utilidades
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private addOneYear(date: Date): Date {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + 1);
    return newDate;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }

  // Validador personalizado para permitir solo números en campos de texto
  numberOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!control.value) {
        return null; // Permitir valores vacíos, otros validadores pueden manejar esto
      }
      
      const valid = /^[0-9]+$/.test(control.value);
      return valid ? null : {'numberOnly': {value: control.value}};
    };
  }

  // Método para capitalizar la primera letra
  private capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
} 