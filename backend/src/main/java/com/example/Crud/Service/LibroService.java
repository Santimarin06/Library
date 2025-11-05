package com.example.Crud.Service;

import com.example.Crud.Entidad.Libro;
import com.example.Crud.repository.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    public List<Libro> getAll() {
        return libroRepository.findAll();
    }

    public Optional<Libro> getById(Long id) {
        return libroRepository.findById(id);
    }

    public List<Libro> findByTitulo(String titulo) {
        return libroRepository.findByTituloContaining(titulo);
    }

    public boolean create(Libro libro) {
        if (libroRepository.findByIsbn(libro.getIsbn()).isEmpty()) {
            libroRepository.save(libro);
            return true;
        }
        return false;
    }

    public boolean update(Libro libro) {
        if (libroRepository.existsById(libro.getLibroId())) {
            libroRepository.save(libro);
            return true;
        }
        return false;
    }

    public String delete(Long id) {
        if (libroRepository.existsById(id)) {
            libroRepository.deleteById(id);
            return "Eliminado";
        }
        return "No existe";
    }
}
