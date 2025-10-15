import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, ScheduleItem } from '../../services/data.service';

@Component({
  selector: 'app-teacher-schedule',
  templateUrl: './teacher-schedule.component.html',
  styleUrls: ['./teacher-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class TeacherScheduleComponent {
  private dataService = inject(DataService);
  viewMode = signal<'grid' | 'list'>('grid');
  
  // Mocking the current teacher's name for filtering, as the user data isn't connected.
  // In a real app, this would come from a user service.
  private teacherNames = ['Dr. Alan Turing', 'Prof. Ada Lovelace'];

  // Filter schedule items for the specific teacher(s)
  scheduleItems = computed(() => {
    const allItems = this.dataService.getScheduleItems();
    // FIX: A signal's value must be accessed by calling it as a function before using array methods like `filter`.
    return allItems().filter(item => this.teacherNames.includes(item.teacher));
  });

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timeSlots = this.generateTimeSlots('08:00', '18:00', 60);

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
