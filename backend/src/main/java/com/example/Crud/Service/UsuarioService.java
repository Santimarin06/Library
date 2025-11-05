package com.example.Crud.Service;

import com.example.Crud.Entidad.Usuario;
import com.example.Crud.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Usuario> getAll() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> getById(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> getByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public boolean create(Usuario usuario) {
        // Evita duplicados por correo o username
        if (usuarioRepository.findByEmail(usuario.getEmail()).isEmpty() &&
                usuarioRepository.findByUsername(usuario.getUsername()).isEmpty()) {
            // Codificar la contraseña solo si no está ya codificada (BCrypt empieza con $2a$ o $2b$)
            String passwordHash = usuario.getPasswordHash();
            if (passwordHash != null && !passwordHash.startsWith("$2a$") && !passwordHash.startsWith("$2b$")) {
                usuario.setPasswordHash(passwordEncoder.encode(passwordHash));
            }
            usuarioRepository.save(usuario);
            return true;
        }
        return false;
    }

    public boolean update(Usuario usuario) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findById(usuario.getUsuarioId());
        if (usuarioExistente.isPresent()) {
            Usuario usuarioActual = usuarioExistente.get();
            
            // Verificar duplicados de email (si cambió y ya existe en otro usuario)
            if (!usuarioActual.getEmail().equals(usuario.getEmail())) {
                Optional<Usuario> usuarioConEmail = usuarioRepository.findByEmail(usuario.getEmail());
                if (usuarioConEmail.isPresent() && !usuarioConEmail.get().getUsuarioId().equals(usuario.getUsuarioId())) {
                    return false; // Email ya existe en otro usuario
                }
            }
            
            // Verificar duplicados de username (si cambió y ya existe en otro usuario)
            if (!usuarioActual.getUsername().equals(usuario.getUsername())) {
                Optional<Usuario> usuarioConUsername = usuarioRepository.findByUsername(usuario.getUsername());
                if (usuarioConUsername.isPresent() && !usuarioConUsername.get().getUsuarioId().equals(usuario.getUsuarioId())) {
                    return false; // Username ya existe en otro usuario
                }
            }
            
            // Actualizar campos básicos
            usuarioActual.setNombre(usuario.getNombre());
            usuarioActual.setUsername(usuario.getUsername());
            usuarioActual.setEmail(usuario.getEmail());
            usuarioActual.setRol(usuario.getRol());
            usuarioActual.setEstado(usuario.getEstado());
            
            // Solo actualizar password si se proporciona uno nuevo (no null y no vacío)
            if (usuario.getPasswordHash() != null && !usuario.getPasswordHash().trim().isEmpty()) {
                usuarioActual.setPasswordHash(passwordEncoder.encode(usuario.getPasswordHash()));
            }
            // Si passwordHash es null o vacío, se mantiene el valor existente
            
            usuarioRepository.save(usuarioActual);
            return true;
        }
        return false;
    }

    public String delete(Long id) {
        if (usuarioRepository.findById(id).isPresent()) {
            usuarioRepository.deleteById(id);
            return "Usuario eliminado correctamente";
        }
        return "El usuario no existe";
    }
}
