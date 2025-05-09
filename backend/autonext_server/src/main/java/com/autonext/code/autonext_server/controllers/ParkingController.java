package com.autonext.code.autonext_server.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autonext.code.autonext_server.dto.ParkingCenterDTO;
import com.autonext.code.autonext_server.dto.ParkingLevelMapDTO;
import com.autonext.code.autonext_server.models.User;
import com.autonext.code.autonext_server.services.CentersService;
import com.autonext.code.autonext_server.services.ParkingService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/parking")
public class ParkingController {

  @Autowired
  private ParkingService parkingService;

  @Autowired
  private CentersService centersService;

  @GetMapping("/level/{id}")
  @SecurityRequirement(name = "bearerAuth")
  public ResponseEntity<?> getLevelWithAvailability(
      @PathVariable int id,
      @RequestParam(required = false) LocalDate date,
      @RequestParam(required = false) String startTime,
      @RequestParam(required = false) String endTime) {

    try {
      User user = getAuthenticatedUser();
      ParkingLevelMapDTO dto = parkingService.getFilteredLevelMap(id, date, startTime, endTime, user);
      return ResponseEntity.ok(dto);
    } catch (RuntimeException e) {
      return ResponseEntity.status(404).body("No se encontró el mapa con id " + id + ": " + e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Error inesperado al obtener el mapa: " + e.getMessage());
    }
  }

  @GetMapping("/centers")
  public ResponseEntity<?> getCenters() {
    try {
      List<ParkingCenterDTO> dto = centersService.getParkingCenters();
      return ResponseEntity.ok(dto);

    } catch (RuntimeException e) {
      return ResponseEntity
          .status(404)
          .body("No se encontraron mapas" + ": " + e.getMessage());

    } catch (Exception e) {
      return ResponseEntity
          .status(500)
          .body("Error inesperado al obtener los mapas: " + e.getMessage());
    }

  }

  private User getAuthenticatedUser() {
    UsernamePasswordAuthenticationToken authentication = (UsernamePasswordAuthenticationToken) SecurityContextHolder
        .getContext().getAuthentication();
    User user = (User) authentication.getPrincipal();
    return user;
  }

  @GetMapping("/centers-names")
  public ResponseEntity<Map<Integer, String>> getWorkCenters() {
    try {
      Map<Integer, String> workCenters = parkingService.getWorkCenters();
      return ResponseEntity.ok(workCenters);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
  }
}