package com.careerhoop.repository;

import com.careerhoop.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollegeRepository extends JpaRepository<College, UUID> {

    Optional<College> findFirstByNameIgnoreCase(String name);
    
    @Query("SELECT DISTINCT c.location FROM College c WHERE c.location IS NOT NULL AND c.location != '' ORDER BY c.location")
    List<String> findDistinctLocations();
    
    @Query("SELECT DISTINCT c.affiliation FROM College c WHERE c.affiliation IS NOT NULL AND c.affiliation != '' ORDER BY c.affiliation")
    List<String> findDistinctAffiliations();
    
    @Query("SELECT c FROM College c WHERE " +
           "(:location IS NULL OR LOWER(c.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:affiliation IS NULL OR LOWER(c.affiliation) LIKE LOWER(CONCAT('%', :affiliation, '%'))) AND " +
           "(:minYear IS NULL OR c.establishedYear >= :minYear) AND " +
           "(:maxYear IS NULL OR c.establishedYear <= :maxYear) AND " +
           "(:type IS NULL OR LOWER(c.type) = LOWER(:type)) AND " +
           "(:program IS NULL OR LOWER(c.programs) LIKE LOWER(CONCAT('%', :program, '%')))")
    List<College> findWithFilters(
        @Param("location") String location,
        @Param("affiliation") String affiliation,
        @Param("minYear") Integer minYear,
        @Param("maxYear") Integer maxYear,
        @Param("type") String type,
        @Param("program") String program
    );
}
