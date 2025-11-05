package com.example.Crud.repository;

import com.example.Crud.Entidad.Autor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface AutorRepository extends JpaRepository<Autor, Long>{

    /*JpaRepository ya tiene los metodos básicos del CRUD y además permite crear consultas personalizadas
        como findByNombre, findByApellido, findByEmail, etc.
        También permite crear consultas con operadores como Containing, Like, Between, etc.
        También permite crear consultas con ordenamiento como OrderByNombreAsc, OrderByApellido
        También permite crear consultas con límites como Top5, First10, etc.
        También permite crear consultas para contar registros como CountByNombre, CountByApellido, etc.
        También permite crear consultas para eliminar registros como DeleteByNombre, DeleteByApellido, etc.
        Esto sin necesidad de escribir una sola línea de SQL o JPQL.

        igual si requieres un consulta SQL, puedes usar la anotación @Query en un método del repositorio.
        Por ejemplo:
        @Query("SELECT a FROM Autor a WHERE a.nombre = ?1")
        List<Autor> findByNombreCustom(String nombre);

        Además de que permite ordenar, filtrar, paginar y muchas cosas más.
     */

    //Sobreescribimos la funcion findAll para obtener todos los autores, y con JPA los obtenemos en una lista
    @Override
    List<Autor> findAll();

    //Metodo para buscar autores por nombre
    List<Autor> findByNombre(String nombre);

    //Metodo para buscar autores por apellido
    List<Autor> findByApellido(String apellido);

    //Metodo para buscar autores por email TODO: cambiar para buscar por correo
    Optional<Autor> findByEmail(String email);

    //Metodo para obtener los autores que contienen un string en su nombre
    List<Autor> findByNombreContaining(String nombre);

    //Metodo para obtener los autores que contienen un string en su apellido
    List<Autor> findByApellidoContaining(String apellido);

    //Metodo para obtener los autores que contienen un string en su email
    List<Autor> findByEmailContaining(String email);

    //Metodo para contar el numero de autores
    Long countByNombre(String nombre);

    //Metodo para eliminar autores por nombre
    Long deleteByNombre(String nombre);

    //Metodo para ordenar los autores por nombre
    List<Autor> findByOrderByNombreAsc();

    //Metodo para ordenar los autores por apellido
    List<Autor> findByOrderByApellidoAsc();

    //Metodo para ordenar los autores por email
    List<Autor> findByOrderByEmailAsc();

    //Metodo para obtener los primeros 5 autores
    List<Autor> findTop5ByOrderByNombreAsc();
}
