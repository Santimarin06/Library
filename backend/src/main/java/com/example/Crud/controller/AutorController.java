

package com.example.Crud.controller;

import com.example.Crud.Entidad.Autor;
import com.example.Crud.Service.AutorService;
import jakarta.websocket.server.PathParam;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path="api/autor")
public class AutorController {
    //Inyectar el servicio
    @Autowired
    private  AutorService autorService;
    
    //Metodos del CRUD

    //Obtener todos los autores
    @GetMapping("obtener-todos")
    public List<Autor> getAll(){
       return autorService.getAll();
    }

    //Obtener un autor por su ID
    @GetMapping("/{autorId}")
    public Optional<Autor> getBI(@PathVariable("autorId")Long autorId){
       return autorService.getAutor(autorId);
    }

    //Cambiar el getMapping TODO: añadir el /{nombre}
    @GetMapping("/nombre/{nombre}")
    public List<Autor> getByName(@PathVariable("nombre")String nombre){
        System.out.println("nombre: " + nombre);
       return autorService.findByNombre(nombre);
    }

    //Actualizar un autor si existe, si no existe devuelve error
    @PutMapping
    public String update(@RequestBody Autor autor){
        if(autorService.update(autor)){
            return "Autor actualizado correctamente";
        }
        return "Error al actualizar el autor: no se encontró el autor o el correo ya existe";
    }
    
    @PostMapping
    public String create(@RequestBody Autor autor){
        if(autorService.create(autor)){
            return "Autor guardado correctamente";
        }
        return "Error al guardar el autor: el correo ya existe";
    }
    
    @DeleteMapping("/{autorId}")
    public String delete(@PathVariable("autorId") Long autorId){
        return autorService.delete(autorId);
    }

}