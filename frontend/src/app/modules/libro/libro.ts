import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Libro as LibroModel } from '../../models/libro.model';
import { Autor as AutorModel } from '../../models/autor.model';
import { Usuario } from '../../models/usuario.model';
import { Prestamo as PrestamoModel } from '../../models/prestamo.model';
import { LibroService } from '../../services/libro.service';
import { AutorService } from '../../services/autor.service';
import { AuthService } from '../../services/auth.service';
import { PrestamoService } from '../../services/prestamo.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-libro',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './libro.html',
  styleUrl: './libro.css',
})
export class LibroComponent implements OnInit {
  libros = signal<LibroModel[]>([]);
  librosFiltrados = signal<LibroModel[]>([]);
  autores = signal<AutorModel[]>([]);
  libroForm: FormGroup;
  prestamoForm: FormGroup;
  isEditing = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showForm = signal(false);
  showPrestamoForm = signal(false);
  libroSeleccionadoParaPrestamo = signal<LibroModel | null>(null);
  currentUsuario = signal<Usuario | null>(null);
  searchTerm = signal('');
  isAdmin = signal(false);

  constructor(
    private libroService: LibroService,
    private autorService: AutorService,
    private authService: AuthService,
    private prestamoService: PrestamoService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder
  ) {
    this.libroForm = this.fb.group({
      libroId: [null],
      titulo: ['', [Validators.required, Validators.minLength(2)]],
      isbn: ['', [Validators.required, Validators.minLength(10)]],
      anio: [new Date().getFullYear(), [Validators.required, Validators.min(1000), Validators.max(9999)]],
      autor: [null, Validators.required]
    });

    this.prestamoForm = this.fb.group({
      fechaDevolucion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isAdmin.set(this.authService.isAdmin());
    this.loadAutores();
    this.loadLibros();
    if (!this.isAdmin()) {
      this.loadCurrentUser();
    }
  }

  loadLibros(): void {
    this.isLoading.set(true);
    this.libroService.getAll().subscribe({
      next: (libros) => {
        this.libros.set(libros);
        this.librosFiltrados.set(libros);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al cargar libros: ' + (error.error || error.message));
        this.isLoading.set(false);
      }
    });
  }

  loadCurrentUser(): void {
    this.usuarioService.getCurrentUser().subscribe({
      next: (usuario) => {
        this.currentUsuario.set(usuario);
      },
      error: (error) => {
        console.error('Error al cargar usuario actual:', error);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      this.librosFiltrados.set(this.libros());
      return;
    }

    const filtrados = this.libros().filter(libro => {
      const tituloMatch = libro.titulo.toLowerCase().includes(term);
      const autorMatch = `${libro.autor.nombre} ${libro.autor.apellido}`.toLowerCase().includes(term);
      const anioMatch = libro.anio.toString().includes(term);
      return tituloMatch || autorMatch || anioMatch;
    });

    this.librosFiltrados.set(filtrados);
  }

  openPrestamoForm(libro: LibroModel): void {
    this.libroSeleccionadoParaPrestamo.set(libro);
    this.showPrestamoForm.set(true);
    this.prestamoForm.reset();
    this.clearMessages();
  }

  closePrestamoForm(): void {
    this.showPrestamoForm.set(false);
    this.libroSeleccionadoParaPrestamo.set(null);
    this.prestamoForm.reset();
    this.clearMessages();
  }

  solicitarPrestamo(): void {
    if (this.prestamoForm.valid && this.libroSeleccionadoParaPrestamo() && this.currentUsuario()) {
      this.isLoading.set(true);
      this.clearMessages();

      const fechaActual = new Date().toISOString().split('T')[0];
      const fechaDevolucion = this.prestamoForm.value.fechaDevolucion;

      const prestamoData: PrestamoModel = {
        libro: this.libroSeleccionadoParaPrestamo()!,
        usuario: this.currentUsuario()!,
        fechaPrestamo: fechaActual,
        fechaDevolucion: fechaDevolucion,
        devuelto: false
      };

      this.prestamoService.create(prestamoData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Préstamo solicitado correctamente');
          this.closePrestamoForm();
          setTimeout(() => {
            this.successMessage.set(null);
          }, 3000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error || 'Error al solicitar préstamo');
        }
      });
    } else {
      this.markFormGroupTouched(this.prestamoForm);
      this.errorMessage.set('Por favor, completa todos los campos requeridos');
    }
  }

  loadAutores(): void {
    this.autorService.getAll().subscribe({
      next: (autores) => {
        this.autores.set(autores);
      },
      error: (error) => {
        console.error('Error al cargar autores:', error);
      }
    });
  }

  openCreateForm(): void {
    this.isEditing.set(false);
    this.showForm.set(true);
    this.libroForm.reset({
      anio: new Date().getFullYear(),
      autor: null
    });
    this.clearMessages();
    
    // Asegurar que los autores estén cargados
    if (this.autores().length === 0) {
      this.loadAutores();
    }
  }

  openEditForm(libro: LibroModel): void {
    this.isEditing.set(true);
    this.showForm.set(true);
    this.libroForm.patchValue({
      libroId: libro.libroId,
      titulo: libro.titulo,
      isbn: libro.isbn,
      anio: libro.anio,
      autor: libro.autor.autorId
    });
    this.clearMessages();
  }

  closeForm(): void {
    this.showForm.set(false);
    this.libroForm.reset({
      anio: new Date().getFullYear()
    });
    this.isEditing.set(false);
    this.clearMessages();
  }

  onSubmit(): void {
    if (this.libroForm.valid) {
      this.isLoading.set(true);
      this.clearMessages();

      const formValue = this.libroForm.value;
      const autorId = formValue.autor;
      
      // Validar que haya seleccionado un autor
      if (!autorId || autorId === '' || autorId === null) {
        this.errorMessage.set('Debe seleccionar un autor válido');
        this.isLoading.set(false);
        this.libroForm.get('autor')?.markAsTouched();
        return;
      }
      
      // Convertir a número si es string
      const autorIdNum = typeof autorId === 'string' ? Number(autorId) : autorId;
      
      // Validar que sea un número válido
      if (isNaN(autorIdNum) || autorIdNum === 0) {
        this.errorMessage.set('Debe seleccionar un autor válido');
        this.isLoading.set(false);
        this.libroForm.get('autor')?.markAsTouched();
        return;
      }
      
      const autorSeleccionado = this.autores().find(a => a.autorId === autorIdNum);

      if (!autorSeleccionado) {
        this.errorMessage.set('El autor seleccionado no es válido. Por favor, recargue la página.');
        this.isLoading.set(false);
        this.loadAutores(); // Recargar autores por si acaso
        return;
      }

      const libroData: LibroModel = {
        libroId: formValue.libroId,
        titulo: formValue.titulo,
        isbn: formValue.isbn,
        anio: formValue.anio,
        autor: autorSeleccionado
      };

      const operation = this.isEditing()
        ? this.libroService.update(libroData)
        : this.libroService.create(libroData);

      operation.subscribe({
        next: (message) => {
          this.isLoading.set(false);
          this.successMessage.set(message || (this.isEditing() ? 'Libro actualizado correctamente' : 'Libro creado correctamente'));
          this.loadLibros();
          setTimeout(() => {
            this.closeForm();
          }, 1500);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error || 'Error al procesar la operación');
        }
      });
    } else {
      this.markFormGroupTouched(this.libroForm);
      this.errorMessage.set('Por favor, completa todos los campos requeridos');
    }
  }

  onDelete(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      this.isLoading.set(true);
      this.clearMessages();

      this.libroService.delete(id).subscribe({
        next: (message) => {
          this.isLoading.set(false);
          this.successMessage.set(message || 'Libro eliminado correctamente');
          this.loadLibros();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error || 'Error al eliminar libro');
        }
      });
    }
  }

  getAutorNombre(autor: AutorModel): string {
    return `${autor.nombre} ${autor.apellido}`;
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
