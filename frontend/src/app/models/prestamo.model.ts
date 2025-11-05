import { Libro } from './libro.model';
import { Usuario } from './usuario.model';

export interface Prestamo {
  prestamoId?: number;
  libro: Libro;
  usuario: Usuario;
  fechaPrestamo: string; // ISO date string
  fechaDevolucion?: string | null; // ISO date string
  devuelto: boolean;
}

