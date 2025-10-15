import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, ScheduleItem } from '../../services/data.service';

@Component({
  selector: 'app-my-schedule',
  templateUrl: './my-schedule.component.html',
  styleUrls: ['./my-schedule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MyScheduleComponent {
  private dataService = inject(DataService);
  viewMode = signal<'grid' | 'list'>('grid');
  
  scheduleItems = this.dataService.getScheduleItems();

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
