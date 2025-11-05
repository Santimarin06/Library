package com.example.Crud.controller;

import com.example.Crud.Entidad.Usuario;
import com.example.Crud.config.JwtTokenProvider;
import com.example.Crud.dto.AuthResponse;
import com.example.Crud.dto.LoginRequest;
import com.example.Crud.repository.UsuarioRepository;
import com.example.Crud.Service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            Usuario usuario = usuarioRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            String token = tokenProvider.generateToken(usuario.getUsername(), usuario.getRol().name());

            return ResponseEntity.ok(new AuthResponse(
                    token,
                    usuario.getUsername(),
                    usuario.getRol().name(),
                    usuario.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error de autenticación: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        try {
            // Codificar la contraseña antes de guardar
            usuario.setPasswordHash(passwordEncoder.encode(usuario.getPasswordHash()));
            // Por defecto, nuevo usuario es LECTOR y ACTIVO
            if (usuario.getRol() == null) {
                usuario.setRol(Usuario.Rol.LECTOR);
            }
            if (usuario.getEstado() == null) {
                usuario.setEstado(Usuario.Estado.ACTIVO);
            }

            if (usuarioService.create(usuario)) {
                String token = tokenProvider.generateToken(usuario.getUsername(), usuario.getRol().name());
                return ResponseEntity.ok(new AuthResponse(
                        token,
                        usuario.getUsername(),
                        usuario.getRol().name(),
                        usuario.getEmail()
                ));
            } else {
                return ResponseEntity.badRequest().body("Error: el correo o username ya existe");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            Usuario usuario = usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener usuario: " + e.getMessage());
        }
    }
}
