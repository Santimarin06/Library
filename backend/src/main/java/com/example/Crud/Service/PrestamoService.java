package com.example.Crud.Service;

import com.example.Crud.Entidad.Prestamo;
import com.example.Crud.repository.PrestamoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PrestamoService {

    private final PrestamoRepository prestamoRepository;

    public PrestamoService(PrestamoRepository prestamoRepository) {
        this.prestamoRepository = prestamoRepository;
    }

    public List<Prestamo> listarTodos() {
        return prestamoRepository.findAll();
    }

    public Optional<Prestamo> buscarPorId(Long id) {
        return prestamoRepository.findById(id);
    }

    public Prestamo guardar(Prestamo prestamo) {
        return prestamoRepository.save(prestamo);
    }

    public Prestamo actualizar(Long id, Prestamo prestamoActualizado) {
        return prestamoRepository.findById(id)
                .map(prestamo -> {
                    prestamo.setLibro(prestamoActualizado.getLibro());
                    prestamo.setUsuario(prestamoActualizado.getUsuario());
                    prestamo.setFechaPrestamo(prestamoActualizado.getFechaPrestamo());
                    prestamo.setFechaDevolucion(prestamoActualizado.getFechaDevolucion());
                    prestamo.setDevuelto(prestamoActualizado.isDevuelto());
                    return prestamoRepository.save(prestamo);
                })
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
    }

    public String delete(Long id) {
        if(prestamoRepository.existsById(id)){
            prestamoRepository.deleteById(id);
            return "Eliminado";
        }
        return "No existe";
    }
}
