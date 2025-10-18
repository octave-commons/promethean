// SPDX-License-Identifier: GPL-3.0-only
// Unified Ollama Queue System - Queue Monitor

import { Job, QueueMetrics } from '../types.js';

interface JobEvent {
  jobId: string;
  timestamp: number;
  eventType: 'submitted' | 'started' | 'completed' | 'failed' | 'canceled';
  job?: Job;
  error?: Error;
}

interface ThroughputMetrics {
  windowStart: number;
  windowEnd: number;
  jobCount: number;
}

export class QueueMonitor {
  private events: JobEvent[] = [];
  private throughputWindows: ThroughputMetrics[] = [];
  private readonly maxEvents = 10000;
  private readonly throughputWindowSize = 60000; // 1 minute windows

  /**
   * Record job submission
   */
  recordJobSubmission(job: Job): void {
    this.addEvent({
      jobId: job.id,
      timestamp: Date.now(),
      eventType: 'submitted',
      job,
    });
  }

  /**
   * Record job start
   */
  recordJobStart(job: Job): void {
    this.addEvent({
      jobId: job.id,
      timestamp: Date.now(),
      eventType: 'started',
      job,
    });
  }

  /**
   * Record job completion
   */
  recordJobCompletion(job: Job): void {
    this.addEvent({
      jobId: job.id,
      timestamp: Date.now(),
      eventType: 'completed',
      job,
    });
    this.updateThroughput('completed');
  }

  /**
   * Record job failure
   */
  recordJobFailure(job: Job, error: Error): void {
    this.addEvent({
      jobId: job.id,
      timestamp: Date.now(),
      eventType: 'failed',
      job,
      error,
    });
  }

  /**
   * Record job cancellation
   */
  recordJobCancellation(job: Job): void {
    this.addEvent({
      jobId: job.id,
      timestamp: Date.now(),
      eventType: 'canceled',
      job,
    });
  }

  /**
   * Add event to the monitor
   */
  private addEvent(event: JobEvent): void {
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Update throughput metrics
   */
  private updateThroughput(eventType: string): void {
    const now = Date.now();
    const windowStart = now - this.throughputWindowSize;
    
    // Find or create current window
    let currentWindow = this.throughputWindows.find(
      window => window.windowStart >= windowStart
    );
    
    if (!currentWindow) {
      currentWindow = {
        windowStart,
        windowEnd: now,
        jobCount: 0,
      };
      this.throughputWindows.push(currentWindow);
    }
    
    currentWindow.jobCount++;
    currentWindow.windowEnd = now;
    
    // Clean old windows
    this.throughputWindows = this.throughputWindows.filter(
      window => window.windowEnd >= windowStart
    );
  }

  /**
   * Get current throughput (jobs per minute)
   */
  getThroughput(): number {
    const now = Date.now();
    const windowStart = now - this.throughputWindowSize;
    
    const recentWindows = this.throughputWindows.filter(
      window => window.windowEnd >= windowStart
    );
    
    if (recentWindows.length === 0) {
      return 0;
    }
    
    const totalJobs = recentWindows.reduce((sum, window) => sum + window.jobCount, 0);
    const timeSpan = (now - Math.min(...recentWindows.map(w => w.windowStart))) / 60000; // minutes
    
    return timeSpan > 0 ? totalJobs / timeSpan : 0;
  }

  /**
   * Get detailed queue metrics
   */
  getMetrics(): QueueMetrics {
    const now = Date.now();
    const recentEvents = this.events.filter(event => now - event.timestamp < 3600000); // Last hour
    
    const submitted = recentEvents.filter(e => e.eventType === 'submitted').length;
    const started = recentEvents.filter(e => e.eventType === 'started').length;
    const completed = recentEvents.filter(e => e.eventType === 'completed').length;
    const failed = recentEvents.filter(e => e.eventType === 'failed').length;
    const canceled = recentEvents.filter(e => e.eventType === 'canceled').length;

    // Calculate average wait time
    const completedJobs = recentEvents.filter(e => e.eventType === 'completed');
    const waitTimes = completedJobs.map(event => {
      const startEvent = this.events.find(
        e => e.jobId === event.jobId && e.eventType === 'started'
      );
      const submitEvent = this.events.find(
        e => e.jobId === event.jobId && e.eventType === 'submitted'
      );
      
      if (startEvent && submitEvent) {
        return startEvent.timestamp - submitEvent.timestamp;
      }
      return 0;
    }).filter(time => time > 0);

    const averageWaitTime = waitTimes.length > 0 
      ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length 
      : 0;

    // Calculate average processing time
    const processingTimes = completedJobs.map(event => {
      const startEvent = this.events.find(
        e => e.jobId === event.jobId && e.eventType === 'started'
      );
      
      if (startEvent) {
        return event.timestamp - startEvent.timestamp;
      }
      return 0;
    }).filter(time => time > 0);

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    return {
      totalJobs: submitted,
      pendingJobs: submitted - started,
      runningJobs: started - completed - failed - canceled,
      completedJobs: completed,
      failedJobs: failed,
      averageWaitTime,
      averageProcessingTime,
      queueDepth: submitted - started,
      throughput: this.getThroughput(),
    };
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): JobEvent[] {
    const events = [...this.events].reverse(); // Most recent first
    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Get events for a specific job
   */
  getJobEvents(jobId: string): JobEvent[] {
    return this.events.filter(event => event.jobId === jobId);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const now = Date.now();
    const lastHour = now - 3600000;
    const lastDay = now - 86400000;
    
    const hourEvents = this.events.filter(e => e.timestamp >= lastHour);
    const dayEvents = this.events.filter(e => e.timestamp >= lastDay);
    
    const hourCompleted = hourEvents.filter(e => e.eventType === 'completed').length;
    const dayCompleted = dayEvents.filter(e => e.eventType === 'completed').length;
    const hourFailed = hourEvents.filter(e => e.eventType === 'failed').length;
    const dayFailed = dayEvents.filter(e => e.eventType === 'failed').length;
    
    return {
      hourly: {
        completed: hourCompleted,
        failed: hourFailed,
        successRate: hourCompleted + hourFailed > 0 ? hourCompleted / (hourCompleted + hourFailed) : 0,
        throughput: hourCompleted / 60, // per minute
      },
      daily: {
        completed: dayCompleted,
        failed: dayFailed,
        successRate: dayCompleted + dayFailed > 0 ? dayCompleted / (dayCompleted + dayFailed) : 0,
        throughput: dayCompleted / 1440, // per minute
      },
      current: {
        throughput: this.getThroughput(),
        queueDepth: this.getMetrics().queueDepth,
      },
    };
  }

  /**
   * Get monitor statistics
   */
  getStatistics() {
    return {
      totalEvents: this.events.length,
      throughputWindows: this.throughputWindows.length,
      currentThroughput: this.getThroughput(),
      performanceStats: this.getPerformanceStats(),
      metrics: this.getMetrics(),
    };
  }

  /**
   * Reset monitor state
   */
  reset(): void {
    this.events = [];
    this.throughputWindows = [];
  }

  /**
   * Export monitor data for analysis
   */
  exportData() {
    return {
      events: this.events,
      throughputWindows: this.throughputWindows,
      statistics: this.getStatistics(),
      exportTimestamp: Date.now(),
    };
  }
}