
package com.example.Crud.Entidad;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;


@Data // anotacion que me no agregar los get y set gracias a la depencia lombok
@Entity
@Table(name = "tb_autor") // nombre de la tabla 
public class Autor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long autorId;
    private String nombre;
    private String apellido;
    @Column(name= "email_address",unique = true,nullable =false)
    private String email;
    
}
