
package com.example.Crud.Service;

import com.example.Crud.Entidad.Autor;
import com.example.Crud.repository.AutorRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AutorService {
    
    @Autowired
    AutorRepository autorRepository;
    
    public List<Autor> getAll(){
        return autorRepository.findAll();
    }

    public List<Autor> findByNombre(String nombre){
        return autorRepository.findByNombre(nombre);
    }

    public Optional<Autor> getAutor(Long id){
        return autorRepository.findById(id);
    }
    
    public Optional<Autor> getEmail(String email){
        return autorRepository.findByEmail(email);
    }
    public boolean create(Autor autor) {
        //si el autor existe no lo crea
        if(!getEmail(autor.getEmail()).isPresent()){
            autorRepository.save(autor);
            return true;
        }
        //si no existe devuelve false
        return false;
    }
    
    public boolean update(Autor autor) {
        Optional<Autor> autorExistente = getAutor(autor.getAutorId());
        if(autorExistente.isPresent()){
            Autor autorActual = autorExistente.get();
            
            // Verificar duplicados de email (si cambió y ya existe en otro autor)
            if (!autorActual.getEmail().equals(autor.getEmail())) {
                Optional<Autor> autorConEmail = getEmail(autor.getEmail());
                if (autorConEmail.isPresent() && !autorConEmail.get().getAutorId().equals(autor.getAutorId())) {
                    return false; // Email ya existe en otro autor
                }
            }
            
            autorRepository.save(autor);
            return true;
        }
        //si no existe devuelve false
        return false;
    }
    
    public String delete(Long id){
        if(getAutor(id).isPresent()){
            autorRepository.deleteById(id);
            return "Autor eliminado correctamente";
        }
        return "El autor no existe";
    }


    
}
