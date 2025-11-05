package com.example.Crud.Entidad;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tb_libro")
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long libroId;
    private String titulo;
    @Column(unique = true, nullable = false)
    private String isbn;
    private int anio;
    // Relación muchos a uno (un autor puede tener varios libros)
    @ManyToOne
    @JoinColumn(name = "autor_id", nullable = false)
    private Autor autor;
}
