import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Prestamo as PrestamoModel } from '../../models/prestamo.model';
import { Libro as LibroModel } from '../../models/libro.model';
import { Usuario } from '../../models/usuario.model';
import { PrestamoService } from '../../services/prestamo.service';
import { LibroService } from '../../services/libro.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-prestamo',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prestamo.html',
  styleUrl: './prestamo.css',
})
export class PrestamoComponent implements OnInit {
  prestamos = signal<PrestamoModel[]>([]);
  prestamosFiltrados = signal<PrestamoModel[]>([]);
  libros = signal<LibroModel[]>([]);
  usuarios = signal<Usuario[]>([]);
  currentUsuario = signal<Usuario | null>(null);
  prestamoForm: FormGroup;
  isEditing = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showForm = signal(false);
  isAdmin = signal(false);

  constructor(
    private prestamoService: PrestamoService,
    private libroService: LibroService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.prestamoForm = this.fb.group({
      prestamoId: [null],
      libro: [null, Validators.required],
      usuario: [null, Validators.required],
      fechaPrestamo: [new Date().toISOString().split('T')[0], Validators.required],
      fechaDevolucion: [null],
      devuelto: [false]
    });
  }

  ngOnInit(): void {
    this.isAdmin.set(this.authService.isAdmin());
    this.loadLibros();
    this.loadUsuarios();
    if (!this.isAdmin()) {
      this.loadCurrentUser();
    } else {
      this.loadPrestamos();
    }
  }

  loadPrestamos(): void {
    this.isLoading.set(true);
    this.prestamoService.getAll().subscribe({
      next: (prestamos) => {
        this.prestamos.set(prestamos);
        if (this.isAdmin()) {
          this.prestamosFiltrados.set(prestamos);
        } else {
          // Para lectores, filtrar solo sus préstamos
          const currentUser = this.currentUsuario();
          if (currentUser) {
            const prestamosUsuario = prestamos.filter(p => p.usuario.usuarioId === currentUser.usuarioId);
            this.prestamosFiltrados.set(prestamosUsuario);
          } else {
            this.prestamosFiltrados.set([]);
          }
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al cargar préstamos: ' + (error.error || error.message));
        this.isLoading.set(false);
      }
    });
  }

  loadCurrentUser(): void {
    // Usar el endpoint /api/auth/me que devuelve el usuario actual autenticado
    this.usuarioService.getCurrentUser().subscribe({
      next: (usuario) => {
        if (usuario) {
          // Guardar en currentUsuario para el filtrado de préstamos
          this.currentUsuario.set(usuario);
          // Guardar también en usuarios para el formulario
          this.usuarios.set([usuario]);
          // Si el formulario está abierto, actualizar el valor del usuario
          if (this.showForm() && !this.isAdmin()) {
            this.prestamoForm.patchValue({
              usuario: usuario.usuarioId
            });
          }
          // Cargar préstamos después de obtener el usuario
          this.loadPrestamos();
        }
      },
      error: (error) => {
        console.error('Error al cargar usuario actual:', error);
        this.errorMessage.set('Error al cargar información del usuario');
        // Intentar cargar préstamos de todas formas
        this.loadPrestamos();
      }
    });
  }

  loadLibros(): void {
    this.libroService.getAll().subscribe({
      next: (libros) => {
        this.libros.set(libros);
      },
      error: (error) => {
        console.error('Error al cargar libros:', error);
      }
    });
  }

  loadUsuarios(): void {
    if (this.isAdmin()) {
      this.usuarioService.getAll().subscribe({
        next: (usuarios) => {
          this.usuarios.set(usuarios);
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
        }
      });
    } else {
      // Para LECTOR, cargar solo su propio usuario
      this.loadCurrentUser();
    }
  }

  openCreateForm(): void {
    this.isEditing.set(false);
    this.showForm.set(true);
    this.clearMessages();
    
    // Asegurar que los datos estén cargados antes de establecer el formulario
    if (this.libros().length === 0) {
      this.loadLibros();
    }
    
    // Resetear el formulario primero
    this.prestamoForm.reset({
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucion: null,
      devuelto: false,
      libro: null,
      usuario: null
    });
    
    // Si no es admin, cargar el usuario actual y establecerlo automáticamente
    if (!this.isAdmin()) {
      if (this.usuarios().length === 0) {
        // Cargar usuario actual - loadCurrentUser() actualizará el formulario automáticamente
        this.loadUsuarios();
      } else {
        // Si ya están cargados, establecer directamente
        const currentUserId = this.getCurrentUserId();
        if (currentUserId) {
          this.prestamoForm.patchValue({
            usuario: currentUserId
          });
        }
      }
    }
  }

  openEditForm(prestamo: PrestamoModel): void {
    this.isEditing.set(true);
    this.showForm.set(true);
    
    const fechaPrestamo = prestamo.fechaPrestamo ? new Date(prestamo.fechaPrestamo).toISOString().split('T')[0] : '';
    const fechaDevolucion = prestamo.fechaDevolucion ? new Date(prestamo.fechaDevolucion).toISOString().split('T')[0] : null;
    
    this.prestamoForm.patchValue({
      prestamoId: prestamo.prestamoId,
      libro: prestamo.libro.libroId,
      usuario: prestamo.usuario.usuarioId,
      fechaPrestamo: fechaPrestamo,
      fechaDevolucion: fechaDevolucion,
      devuelto: prestamo.devuelto
    });
    this.clearMessages();
  }

  closeForm(): void {
    this.showForm.set(false);
    this.prestamoForm.reset({
      fechaPrestamo: new Date().toISOString().split('T')[0],
      devuelto: false
    });
    this.isEditing.set(false);
    this.clearMessages();
  }

  onSubmit(): void {
    if (this.prestamoForm.valid) {
      this.isLoading.set(true);
      this.clearMessages();

      const formValue = this.prestamoForm.value;
      
      // Validar y obtener libro
      const libroId = typeof formValue.libro === 'string' ? Number(formValue.libro) : formValue.libro;
      const libroSeleccionado = this.libros().find(l => l.libroId === libroId);
      if (!libroSeleccionado) {
        this.errorMessage.set('Debe seleccionar un libro válido');
        this.isLoading.set(false);
        return;
      }

      // Validar y obtener usuario
      const usuarioId = typeof formValue.usuario === 'string' ? Number(formValue.usuario) : formValue.usuario;
      const usuarioSeleccionado = this.usuarios().find(u => u.usuarioId === usuarioId);
      if (!usuarioSeleccionado) {
        this.errorMessage.set('Debe seleccionar un usuario válido');
        this.isLoading.set(false);
        return;
      }

      const prestamoData: PrestamoModel = {
        prestamoId: formValue.prestamoId,
        libro: libroSeleccionado,
        usuario: usuarioSeleccionado,
        fechaPrestamo: formValue.fechaPrestamo,
        fechaDevolucion: formValue.fechaDevolucion || null,
        devuelto: formValue.devuelto || false
      };

      if (this.isEditing()) {
        this.prestamoService.update(prestamoData.prestamoId!, prestamoData).subscribe({
          next: (message) => {
            this.isLoading.set(false);
            this.successMessage.set('Préstamo actualizado correctamente');
            this.loadPrestamos();
            setTimeout(() => {
              this.closeForm();
            }, 1500);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(error.error || 'Error al actualizar préstamo');
          }
        });
      } else {
        this.prestamoService.create(prestamoData).subscribe({
          next: (message) => {
            this.isLoading.set(false);
            this.successMessage.set('Préstamo creado correctamente');
            this.loadPrestamos();
            setTimeout(() => {
              this.closeForm();
            }, 1500);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(error.error || 'Error al crear préstamo');
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.prestamoForm);
      this.errorMessage.set('Por favor, completa todos los campos requeridos');
    }
  }

  onDelete(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este préstamo?')) {
      this.isLoading.set(true);
      this.clearMessages();

      this.prestamoService.delete(id).subscribe({
        next: (message) => {
          this.isLoading.set(false);
          this.successMessage.set(message || 'Préstamo eliminado correctamente');
          this.loadPrestamos();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error || 'Error al eliminar préstamo');
        }
      });
    }
  }

  marcarDevuelto(prestamo: PrestamoModel): void {
    if (confirm('¿Marcar este préstamo como devuelto?')) {
      const fechaDevolucion = new Date().toISOString().split('T')[0];
      const prestamoActualizado: PrestamoModel = {
        ...prestamo,
        fechaDevolucion: fechaDevolucion,
        devuelto: true
      };

      this.prestamoService.update(prestamo.prestamoId!, prestamoActualizado).subscribe({
        next: () => {
          this.successMessage.set('Préstamo marcado como devuelto');
          this.loadPrestamos();
        },
        error: (error) => {
          this.errorMessage.set(error.error || 'Error al marcar como devuelto');
        }
      });
    }
  }

  getLibroTitulo(libro: LibroModel): string {
    return libro.titulo;
  }

  getUsuarioNombre(usuario: Usuario): string {
    return usuario.nombre;
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getCurrentUserId(): number | null {
    if (!this.isAdmin()) {
      // Para LECTOR, obtener su propio usuario
      const usuarios = this.usuarios();
      if (usuarios.length > 0) {
        return usuarios[0].usuarioId || null;
      }
    }
    return null;
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
