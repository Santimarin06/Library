package com.example.Crud.repository;

import com.example.Crud.Entidad.Prestamo;
import com.example.Crud.Entidad.Usuario;
import com.example.Crud.Entidad.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    List<Prestamo> findByUsuario(Usuario usuario);

    List<Prestamo> findByLibro(Libro libro);

    List<Prestamo> findByDevuelto(boolean devuelto);
}

