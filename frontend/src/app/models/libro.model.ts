import { Autor } from './autor.model';

export interface Libro {
  libroId?: number;
  titulo: string;
  isbn: string;
  anio: number;
  autor: Autor;
}

