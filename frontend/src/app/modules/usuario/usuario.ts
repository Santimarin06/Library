import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css',
})
export class UsuarioComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  usuarioForm: FormGroup;
  isEditing = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showForm = signal(false);
  isAdmin = signal(false);

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.usuarioForm = this.fb.group({
      usuarioId: [null],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      passwordHash: ['', [Validators.minLength(6)]],
      rol: ['LECTOR', [Validators.required]],
      estado: ['ACTIVO', [Validators.required]]
    });

    // Validación condicional para passwordHash
    this.usuarioForm.get('usuarioId')?.valueChanges.subscribe(id => {
      const passwordControl = this.usuarioForm.get('passwordHash');
      if (id) {
        // Editando: password opcional
        passwordControl?.clearValidators();
      } else {
        // Creando: password requerido
        passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      }
      passwordControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.isAdmin.set(this.authService.isAdmin());
    if (this.isAdmin()) {
      this.loadUsuarios();
    }
  }

  loadUsuarios(): void {
    this.isLoading.set(true);
    this.usuarioService.getAll().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al cargar usuarios: ' + (error.error || error.message));
        this.isLoading.set(false);
      }
    });
  }

  openCreateForm(): void {
    this.isEditing.set(false);
    this.showForm.set(true);
    this.usuarioForm.reset({
      rol: 'LECTOR',
      estado: 'ACTIVO'
    });
    this.clearMessages();
  }

  openEditForm(usuario: Usuario): void {
    this.isEditing.set(true);
    this.showForm.set(true);
    this.usuarioForm.patchValue({
      usuarioId: usuario.usuarioId,
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
      passwordHash: '' // No prellenar password
    });
    this.clearMessages();
  }

  closeForm(): void {
    this.showForm.set(false);
    this.usuarioForm.reset();
    this.isEditing.set(false);
    this.clearMessages();
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.isLoading.set(true);
      this.clearMessages();

      const usuarioData = { ...this.usuarioForm.value };
      
      // Si está editando y no hay password, removerlo
      if (this.isEditing() && !usuarioData.passwordHash) {
        delete usuarioData.passwordHash;
      }

      const operation = this.isEditing()
        ? this.usuarioService.update(usuarioData)
        : this.usuarioService.create(usuarioData);

      operation.subscribe({
        next: (message) => {
          this.isLoading.set(false);
          this.successMessage.set(message || (this.isEditing() ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'));
          this.loadUsuarios();
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
      this.markFormGroupTouched(this.usuarioForm);
      this.errorMessage.set('Por favor, completa todos los campos requeridos');
    }
  }

  onDelete(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.isLoading.set(true);
      this.clearMessages();

      this.usuarioService.delete(id).subscribe({
        next: (message) => {
          this.isLoading.set(false);
          this.successMessage.set(message || 'Usuario eliminado correctamente');
          this.loadUsuarios();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error || 'Error al eliminar usuario');
        }
      });
    }
  }

  getRolBadgeClass(rol: string): string {
    return rol === 'ADMIN' ? 'badge-admin' : 'badge-lector';
  }

  getEstadoBadgeClass(estado: string): string {
    return estado === 'ACTIVO' ? 'badge-activo' : 'badge-inactivo';
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
