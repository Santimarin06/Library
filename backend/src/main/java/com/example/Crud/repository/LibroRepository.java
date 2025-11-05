package com.example.Crud.repository;

import com.example.Crud.Entidad.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LibroRepository extends JpaRepository<Libro, Long> {
    List<Libro> findByTituloContaining(String titulo);
    List<Libro> findByAutor_NombreContaining(String nombreAutor);
    List<Libro> findByIsbn(String isbn);
}

