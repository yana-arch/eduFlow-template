import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

// FIX: Added OnPush change detection strategy for performance.
@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class TeacherDashboardComponent {
  private dataService = inject(DataService);

  schedule = this.dataService.getTeacherSchedule();
  myClasses = this.dataService.getTeacherClasses();
  attendance = this.dataService.getAttendance();


  updateAttendance(id: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.dataService.updateAttendance(id, isChecked);
  }

  getSubjectIcon(icon: string): string {
    const icons: Record<string, string> = {
      calculator: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m-6 4h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" />',
      beaker: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.443 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.443a2 2 0 001.806.547a2 2 0 00.547-1.806l-.443-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l-2.387-.443zM12 6.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />'
    };
    return icons[icon] || '';
  }
}
