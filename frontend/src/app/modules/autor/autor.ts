import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Autor as AutorModel } from '../../models/autor.model';
import { AutorService } from '../../services/autor.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-autor',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './autor.html',
  styleUrl: './autor.css',
})

export class AutorComponent implements OnInit {
  autores = signal<AutorModel[]>([]);
  autorForm: FormGroup;
  isEditing = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showForm = signal(false);
  isAdmin = signal(false);

  constructor(
    private autorService: AutorService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.autorForm = this.fb.group({
      autorId: [null],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.isAdmin.set(this.authService.isAdmin());
    if (this.isAdmin()) {
      this.loadAutores();
    }
  }

  loadAutores(): void {
    this.isLoading.set(true);
    this.autorService.getAll().subscribe({
      next: (autores) => {
        this.autores.set(autores);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al cargar autores: ' + (error.error || error.message));
        this.isLoading.set(false);
      }
    });
  }

  openCreateForm(): void {
    this.isEditing.set(false);
    this.showForm.set(true);
    this.autorForm.reset();
    this.clearMessages();
  }

  openEditForm(autor: AutorModel): void {
    this.isEditing.set(true);
    this.showForm.set(true);
    this.autorForm.patchValue({
      autorId: autor.autorId,
      nombre: autor.nombre,
      apellido: autor.apellido,
      email: autor.email
    });
    this.clearMessages();
  }

  closeForm(): void {
    this.showForm.set(false);
    this.autorForm.reset();
    this.isEditing.set(false);
    this.clearMessages();
  }

  onSubmit(): void {
    if (this.autorForm.valid) {
      this.isLoading.set(true);
      this.clearMessages();

      const autorData = { ...this.autorForm.value };

      const operation = this.isEditing()
        ? this.autorService.update(autorData)
        : this.autorService.create(autorData);

      operation.subscribe({
        next: (message) => {
          this.isLoading.set(false);
          this.successMessage.set(message || (this.isEditing() ? 'Autor actualizado correctamente' : 'Autor creado correctamente'));
          this.loadAutores();
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
      this.markFormGroupTouched(this.autorForm);
      this.errorMessage.set('Por favor, completa todos los campos requeridos');
    }
  }

  onDelete(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este autor?')) {
      this.isLoading.set(true);
      this.clearMessages();

      this.autorService.delete(id).subscribe({
        next: (message) => {
          this.isLoading.set(false);
          this.successMessage.set(message || 'Autor eliminado correctamente');
          this.loadAutores();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error || 'Error al eliminar autor');
        }
      });
    }
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
