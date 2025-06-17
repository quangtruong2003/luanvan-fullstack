package com.luanvan.luanvanbackend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.Set;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"specialties", "availabilitySlots"})
@ToString(exclude = {"specialties", "availabilitySlots"})
public class Doctor {
    @Id
    private Long doctorId;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
      @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;
    
    @OneToMany(mappedBy = "doctor")
    //Lombok @Data tự động tạo hashCode() và equals() bao gồm tất cả fields, gây ra infinite loop và concurrent modification.
    //Thêm JSON annotations để tránh circular reference
    @JsonIgnore
    private Set<DoctorSpecialty> specialties;
    
    @OneToMany(mappedBy = "doctor")
    @JsonIgnore
    private Set<AvailabilitySlot> availabilitySlots;
}
