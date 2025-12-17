package com.careerhoop.controller;

import com.careerhoop.dto.*;
import com.careerhoop.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDto> getStats() {
        try {
            AdminDashboardStatsDto stats = adminDashboardService.getStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch dashboard stats: " + e.getMessage());
        }
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<RecentActivityDto>> getRecentActivity() {
        try {
            List<RecentActivityDto> activities = adminDashboardService.getRecentActivity();
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch recent activity: " + e.getMessage());
        }
    }

    @GetMapping("/growth-metrics")
    public ResponseEntity<List<GrowthMetricsDto>> getGrowthMetrics() {
        try {
            List<GrowthMetricsDto> metrics = adminDashboardService.getGrowthMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch growth metrics: " + e.getMessage());
        }
    }

    @GetMapping("/trends")
    public ResponseEntity<List<TrendDataDto>> getTrends(
            @RequestParam(defaultValue = "30") int days
    ) {
        try {
            if (days < 1 || days > 365) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Days parameter must be between 1 and 365");
            }
            List<TrendDataDto> trends = adminDashboardService.getTrends(days);
            return ResponseEntity.ok(trends);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch trends: " + e.getMessage());
        }
    }

    @GetMapping("/system-health")
    public ResponseEntity<SystemHealthDto> getSystemHealth() {
        try {
            SystemHealthDto health = adminDashboardService.getSystemHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch system health: " + e.getMessage());
        }
    }

    @GetMapping("/engagement")
    public ResponseEntity<UserEngagementDto> getEngagement() {
        try {
            UserEngagementDto engagement = adminDashboardService.getUserEngagement();
            return ResponseEntity.ok(engagement);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch engagement metrics: " + e.getMessage());
        }
    }

    @GetMapping("/pending-counts")
    public ResponseEntity<PendingCountsDto> getPendingCounts() {
        try {
            PendingCountsDto counts = adminDashboardService.getPendingCounts();
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch pending counts: " + e.getMessage());
        }
    }
}

