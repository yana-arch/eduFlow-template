import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, ScheduleItem } from '../../services/data.service';

@Component({
  selector: 'app-student-schedule',
  templateUrl: './student-schedule.component.html',
  styleUrls: ['./student-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class StudentScheduleComponent {
  private dataService = inject(DataService);
  viewMode = signal<'grid' | 'list'>('grid');
  
  // Mock the current student's ID. In a real app, this would come from an auth service.
  private currentStudentId = 3; // Peter Jones

  // Filter state
  selectedDay = signal<string>('all');
  selectedCourse = signal<string>('all');

  // Base schedule for the current student
  private studentSchedule = computed(() => {
    const allItems = this.dataService.getScheduleItems();
    return allItems().filter(item => item.studentIds.includes(this.currentStudentId));
  });

  // Options for filter dropdowns, derived from the student's schedule
  availableDays = computed(() => {
    // FIX: Explicitly typing the Set as Set<string> helps TypeScript correctly infer the type of 'days', preventing the parameters in the sort callback from being typed as 'unknown'.
    const days = new Set<string>(this.studentSchedule().map(item => item.day));
    // Sort days according to daysOfWeek array
    return ['all', ...Array.from(days).sort((a, b) => this.daysOfWeek.indexOf(a) - this.daysOfWeek.indexOf(b))];
  });
  
  availableCourses = computed(() => {
    const courses = new Set(this.studentSchedule().map(item => item.courseName));
    return ['all', ...Array.from(courses).sort()];
  });

  // Schedule items after applying filters
  scheduleItems = computed(() => {
    const day = this.selectedDay();
    const course = this.selectedCourse();
    
    return this.studentSchedule().filter(item => {
      const dayMatch = day === 'all' || item.day === day;
      const courseMatch = course === 'all' || item.courseName === course;
      return dayMatch && courseMatch;
    });
  });

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timeSlots = this.generateTimeSlots('08:00', '18:00', 60);

  // Filter methods
  onDayChange(event: Event) {
    this.selectedDay.set((event.target as HTMLSelectElement).value);
  }

  onCourseChange(event: Event) {
    this.selectedCourse.set((event.target as HTMLSelectElement).value);
  }

  resetFilters() {
    this.selectedDay.set('all');
    this.selectedCourse.set('all');
  }

  generateTimeSlots(start: string, end: string, interval: number): string[] {
    const slots = [];
    let currentTime = this.timeToMinutes(start);
    const endTime = this.timeToMinutes(end);

    while (currentTime <= endTime) {
      slots.push(this.minutesToTime(currentTime));
      currentTime += interval;
    }
    return slots;
  }
  
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  calculateGridPosition(item: ScheduleItem) {
    const startMinutes = this.timeToMinutes(item.startTime) - this.timeToMinutes(this.timeSlots[0]);
    const endMinutes = this.timeToMinutes(item.endTime) - this.timeToMinutes(this.timeSlots[0]);
    const duration = endMinutes - startMinutes;
    
    // Assuming 1 hour slot = 60px height. 1 min = 1px.
    const top = startMinutes; 
    const height = duration;

    const dayIndex = this.daysOfWeek.indexOf(item.day) + 1;

    return {
      'grid-column-start': dayIndex + 1,
      'grid-row-start': '1',
      'transform': `translateY(${top}px)`,
      'height': `${height}px`,
    };
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }
}
