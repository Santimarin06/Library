package com.example.Crud.controller;

import com.example.Crud.Entidad.Libro;
import com.example.Crud.Service.LibroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/libro")
public class LibroController {

    @Autowired
    private LibroService libroService;

    @GetMapping("obtener-todos")
    public List<Libro> getAll() {
        return libroService.getAll();
    }

    @GetMapping("/{id}")
    public Optional<Libro> getById(@PathVariable("id") Long id) {
        return libroService.getById(id);
    }

    @GetMapping("/titulo/{titulo}")
    public List<Libro> getByTitulo(@PathVariable("titulo") String titulo) {
        return libroService.findByTitulo(titulo);
    }

    @PostMapping
    public String create(@RequestBody Libro libro) {
        return libroService.create(libro) ? "Libro guardado correctamente" : "Error: ISBN duplicado";
    }

    @PutMapping
    public String update(@RequestBody Libro libro) {
        return libroService.update(libro) ? "Libro actualizado" : "Error al actualizar (no existe)";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable("id") Long id) {
        return libroService.delete(id);
    }
}
