package com.parqueadero.parqueadero.servicio;

import com.parqueadero.parqueadero.modelo.*;
import com.parqueadero.parqueadero.repositorio.ParkingSpotRepository;
import com.parqueadero.parqueadero.repositorio.VehiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ParkingSpotService {
    private final ParkingSpotRepository spotRepo;
    private final VehiculoRepository vehiculoRepo;

    public ParkingSpotService(ParkingSpotRepository spotRepo, VehiculoRepository vehiculoRepo) {
        this.spotRepo = spotRepo;
        this.vehiculoRepo = vehiculoRepo;
    }

    public List<ParkingSpot> listar() { return spotRepo.findAll(); }

    @Transactional
    public ParkingSpot reservar(Long spotId) {
        var s = spotRepo.findById(spotId).orElseThrow();
        s.setEstado(SpotStatus.RESERVADO);
        s.setVehiculo(null);
        return s;
    }

    @Transactional
    public ParkingSpot mantenimiento(Long spotId) {
        var s = spotRepo.findById(spotId).orElseThrow();
        s.setEstado(SpotStatus.MANTENIMIENTO);
        s.setVehiculo(null);
        return s;
    }

    @Transactional
    public ParkingSpot liberar(Long spotId) {
        var s = spotRepo.findById(spotId).orElseThrow();
        s.setEstado(SpotStatus.DISPONIBLE);
        s.setVehiculo(null);
        return s;
    }

    @Transactional
    public ParkingSpot ocupar(Long spotId, Long vehiculoId) {
        var s = spotRepo.findById(spotId).orElseThrow();
        if (vehiculoId == null) {
            s.setEstado(SpotStatus.OCUPADO);
            s.setVehiculo(null);
            return s;
        }
        var v = vehiculoRepo.findById(vehiculoId).orElseThrow();
        s.setEstado(SpotStatus.OCUPADO);
        s.setVehiculo(v);
        return s;
    }
}
