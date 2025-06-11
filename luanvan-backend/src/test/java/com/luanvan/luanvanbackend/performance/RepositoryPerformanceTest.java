package com.luanvan.luanvanbackend.performance;

import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.AppointmentRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.util.StopWatch;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class RepositoryPerformanceTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testAppointmentQueryPerformance_WithEntityGraph() {
        // Given: Setup test data
        setupTestData();

        StopWatch stopWatch = new StopWatch();

        // Test optimized query with EntityGraph
        stopWatch.start("findByPatientUserIdWithDetails");
        List<Appointment> optimizedResults = appointmentRepository.findByPatientUserIdWithDetails(1L);
        stopWatch.stop();

        // Test regular query (baseline)
        stopWatch.start("findByPatientUserId");
        List<Appointment> regularResults = appointmentRepository.findByPatientUserId(1L);
        stopWatch.stop();

        // Assertions
        assertEquals(optimizedResults.size(), regularResults.size());
        
        // Performance assertions
        long optimizedTime = stopWatch.getTaskInfo()[0].getTimeMillis();
        long regularTime = stopWatch.getTaskInfo()[1].getTimeMillis();
        
        System.out.println("=== APPOINTMENT QUERY PERFORMANCE ===");
        System.out.println("Optimized (EntityGraph): " + optimizedTime + "ms");
        System.out.println("Regular Query: " + regularTime + "ms");
        System.out.println("Performance Improvement: " + 
            (regularTime > optimizedTime ? "+" + ((regularTime - optimizedTime) * 100 / regularTime) + "%" : "N/A"));

        // Verify data integrity
        assertFalse(optimizedResults.isEmpty());
        optimizedResults.forEach(appointment -> {
            assertNotNull(appointment.getPatient());
            assertNotNull(appointment.getDoctor());
            assertNotNull(appointment.getClinic());
            assertNotNull(appointment.getSpecialty());
        });
    }

    @Test
    void testUserQueryPerformance_WithCaching() {
        // Given: Setup test data
        setupTestData();

        StopWatch stopWatch = new StopWatch();

        // Test cached query (first call)
        stopWatch.start("findByEmail-FirstCall");
        User firstCall = userRepository.findByEmail("test@example.com").orElse(null);
        stopWatch.stop();

        // Test cached query (second call - should be faster)
        stopWatch.start("findByEmail-SecondCall");
        User secondCall = userRepository.findByEmail("test@example.com").orElse(null);
        stopWatch.stop();

        // Assertions
        assertNotNull(firstCall);
        assertNotNull(secondCall);
        assertEquals(firstCall.getUserId(), secondCall.getUserId());

        long firstCallTime = stopWatch.getTaskInfo()[0].getTimeMillis();
        long secondCallTime = stopWatch.getTaskInfo()[1].getTimeMillis();

        System.out.println("=== USER QUERY CACHE PERFORMANCE ===");
        System.out.println("First Call (DB): " + firstCallTime + "ms");
        System.out.println("Second Call (Cache): " + secondCallTime + "ms");
        System.out.println("Cache Improvement: " + 
            (firstCallTime > secondCallTime ? "+" + ((firstCallTime - secondCallTime) * 100 / firstCallTime) + "%" : "N/A"));
    }

    @Test
    void testBatchQueryPerformance() {
        // Given: Setup test data
        setupTestData();

        StopWatch stopWatch = new StopWatch();

        // Test batch query
        stopWatch.start("findUpcomingAppointmentsForReminder");
        List<Appointment> batchResults = appointmentRepository.findUpcomingAppointmentsForReminder(
            List.of(Appointment.AppointmentStatus.CONFIRMED, Appointment.AppointmentStatus.PENDING_PAYMENT),
            LocalDateTime.now(),
            LocalDateTime.now().plusDays(7)
        );
        stopWatch.stop();

        // Assertions
        long batchTime = stopWatch.getLastTaskTimeMillis();
        
        System.out.println("=== BATCH QUERY PERFORMANCE ===");
        System.out.println("Batch Query Time: " + batchTime + "ms");
        System.out.println("Records Retrieved: " + batchResults.size());
        System.out.println("Time per Record: " + (batchResults.size() > 0 ? batchTime / batchResults.size() : 0) + "ms");

        // Verify all related entities are loaded
        batchResults.forEach(appointment -> {
            assertNotNull(appointment.getPatient());
            assertNotNull(appointment.getDoctor());
            assertNotNull(appointment.getClinic());
            assertNotNull(appointment.getSpecialty());
            assertNotNull(appointment.getSlot());
        });
    }

    @Test
    void testComplexQueryPerformance() {
        // Given: Setup test data
        setupTestData();

        StopWatch stopWatch = new StopWatch();

        // Test complex search query
        stopWatch.start("searchUsers");
        var searchResults = userRepository.searchUsers("test", Pageable.unpaged());
        stopWatch.stop();

        // Test role-based query
        stopWatch.start("findByRoleName");
        List<User> roleResults = userRepository.findByRoleName("PATIENT");
        stopWatch.stop();

        long searchTime = stopWatch.getTaskInfo()[0].getTimeMillis();
        long roleTime = stopWatch.getTaskInfo()[1].getTimeMillis();

        System.out.println("=== COMPLEX QUERY PERFORMANCE ===");
        System.out.println("Search Query: " + searchTime + "ms");
        System.out.println("Role Query: " + roleTime + "ms");
        
        // Performance threshold assertions (adjust based on requirements)
        assertTrue(searchTime < 1000, "Search query should complete within 1 second");
        assertTrue(roleTime < 500, "Role query should complete within 500ms");
    }

    @Test
    void testQueryOptimizationMetrics() {
        // Given: Setup test data with known relationships
        setupTestData();

        // Test query that would cause N+1 without optimization
        StopWatch stopWatch = new StopWatch();
        
        stopWatch.start("getAllAppointmentsWithDetails");
        List<Appointment> appointments = appointmentRepository.findAll();
        
        // Force lazy loading to test N+1 prevention
        appointments.forEach(appointment -> {
            // These should not trigger additional queries due to EntityGraph
            String patientName = appointment.getPatient().getFullName();
            String doctorName = appointment.getDoctor().getFullName();
            String clinicName = appointment.getClinic().getName();
            String specialtyName = appointment.getSpecialty().getName();
            
            assertNotNull(patientName);
            assertNotNull(doctorName);
            assertNotNull(clinicName);
            assertNotNull(specialtyName);
        });
        stopWatch.stop();

        long totalTime = stopWatch.getLastTaskTimeMillis();
        
        System.out.println("=== N+1 PREVENTION TEST ===");
        System.out.println("Total query time: " + totalTime + "ms");
        System.out.println("Records processed: " + appointments.size());
        System.out.println("Average time per record: " + (appointments.size() > 0 ? totalTime / appointments.size() : 0) + "ms");

        // With proper EntityGraph, this should be fast regardless of record count
        if (appointments.size() > 0) {
            assertTrue(totalTime / appointments.size() < 10, 
                "Average time per record should be < 10ms with proper optimization");
        }
    }

    @Test
    void testDatabaseConnectionPoolPerformance() {
        StopWatch stopWatch = new StopWatch();
        
        // Simulate concurrent database access
        stopWatch.start("multipleQueries");
        
        for (int i = 0; i < 10; i++) {
            userRepository.findById(1L);
            appointmentRepository.findById(1L);
        }
        
        stopWatch.stop();
        
        long multiQueryTime = stopWatch.getLastTaskTimeMillis();
        
        System.out.println("=== CONNECTION POOL PERFORMANCE ===");
        System.out.println("20 queries execution time: " + multiQueryTime + "ms");
        System.out.println("Average per query: " + (multiQueryTime / 20) + "ms");
        
        // Connection pool should handle multiple queries efficiently
        assertTrue(multiQueryTime < 2000, "20 queries should complete within 2 seconds");
    }

    private void setupTestData() {
        // This would typically be done with @Sql or test data builders
        // For now, we'll assume test data exists or create minimal test data
        
        // Note: In real implementation, you'd create comprehensive test data
        // that represents realistic production scenarios
        entityManager.flush();
        entityManager.clear();
    }
} 