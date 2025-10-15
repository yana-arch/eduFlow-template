import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DataService, SchoolEvent } from '../../services/data.service';

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgOptimizedImage],
})
export class MyEventsComponent {
  private dataService = inject(DataService);
  events = this.dataService.getSchoolEvents();

  filter = signal<'all' | 'registered'>('all');

  filteredEvents = computed(() => {
    if (this.filter() === 'registered') {
      return this.events().filter(e => e.isRegistered);
    }
    return this.events();
  });

  setFilter(newFilter: 'all' | 'registered') {
    this.filter.set(newFilter);
  }

  toggleRegistration(eventId: number) {
    this.dataService.toggleEventRegistration(eventId);
  }

  getCategoryStyles(category: string): { color: string } {
    switch (category) {
      case 'Career': return { color: 'blue' };
      case 'Academic': return { color: 'indigo' };
      case 'Social': return { color: 'rose' };
      case 'Workshop': return { color: 'amber' };
      default: return { color: 'gray' };
    }
  }
}
