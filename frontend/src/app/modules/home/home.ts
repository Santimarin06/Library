import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibroService } from '../../services/libro.service';
import { AutorService } from '../../services/autor.service';
import { UsuarioService } from '../../services/usuario.service';
import { PrestamoService } from '../../services/prestamo.service';
import { AuthService } from '../../services/auth.service';
import { Libro as LibroModel } from '../../models/libro.model';
import { Autor as AutorModel } from '../../models/autor.model';
import { Usuario } from '../../models/usuario.model';
import { Prestamo } from '../../models/prestamo.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  totalLibros = signal(0);
  totalAutores = signal(0);
  totalUsuarios = signal(0);
  totalPrestamos = signal(0);
  prestamosActivos = signal(0);
  prestamosDevueltos = signal(0);
  isLoading = signal(true);
  isAdmin = signal(false);
  currentUsername = signal<string>('');
  currentUsuario = signal<Usuario | null>(null);

  recentLibros = signal<LibroModel[]>([]);
  recentPrestamos = signal<Prestamo[]>([]);
  prestamosActivosList = signal<Prestamo[]>([]);

  constructor(
    private libroService: LibroService,
    private autorService: AutorService,
    private usuarioService: UsuarioService,
    private prestamoService: PrestamoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin.set(this.authService.isAdmin());
    const currentUser = this.authService.getCurrentUser()();
    this.currentUsername.set(currentUser?.username || '');
    if (!this.isAdmin()) {
      this.loadCurrentUser();
    } else {
      this.loadStatistics();
    }
  }

  loadCurrentUser(): void {
    this.usuarioService.getCurrentUser().subscribe({
      next: (usuario) => {
        this.currentUsuario.set(usuario);
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error al cargar usuario actual:', error);
        // Cargar estadísticas de todas formas
        this.loadStatistics();
      }
    });
  }

  loadStatistics(): void {
    this.isLoading.set(true);

    // Cargar libros
    this.libroService.getAll().subscribe({
      next: (libros) => {
        this.totalLibros.set(libros.length);
        this.recentLibros.set(libros.slice(-5).reverse());
      },
      error: (error) => console.error('Error al cargar libros:', error)
    });

    // Cargar autores
    this.autorService.getAll().subscribe({
      next: (autores) => {
        this.totalAutores.set(autores.length);
      },
      error: (error) => console.error('Error al cargar autores:', error)
    });

    // Cargar usuarios (solo si es admin)
    if (this.isAdmin()) {
      this.usuarioService.getAll().subscribe({
        next: (usuarios) => {
          this.totalUsuarios.set(usuarios.length);
        },
        error: (error) => console.error('Error al cargar usuarios:', error)
      });
    }

    // Cargar préstamos
    this.prestamoService.getAll().subscribe({
      next: (prestamos) => {
        this.totalPrestamos.set(prestamos.length);
        
        if (this.isAdmin()) {
          // Para admin, mostrar todos los préstamos
          this.prestamosActivos.set(prestamos.filter(p => !p.devuelto).length);
          this.prestamosDevueltos.set(prestamos.filter(p => p.devuelto).length);
          this.recentPrestamos.set(prestamos.slice(-5).reverse());
          this.prestamosActivosList.set(prestamos.filter(p => !p.devuelto));
        } else {
          // Para lector, filtrar solo sus préstamos
          const currentUser = this.currentUsuario();
          if (currentUser) {
            const prestamosUsuario = prestamos.filter(p => p.usuario.usuarioId === currentUser.usuarioId);
            this.prestamosActivos.set(prestamosUsuario.filter(p => !p.devuelto).length);
            this.prestamosDevueltos.set(prestamosUsuario.filter(p => p.devuelto).length);
            this.recentPrestamos.set(prestamosUsuario.slice(-5).reverse());
            this.prestamosActivosList.set(prestamosUsuario.filter(p => !p.devuelto));
          } else {
            // Si no hay usuario, no mostrar préstamos
            this.prestamosActivos.set(0);
            this.prestamosDevueltos.set(0);
            this.recentPrestamos.set([]);
            this.prestamosActivosList.set([]);
          }
        }
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar préstamos:', error);
        this.isLoading.set(false);
      }
    });
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
}
