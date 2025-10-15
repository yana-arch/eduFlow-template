import { Component, ChangeDetectionStrategy, signal, inject, ElementRef } from '@angular/core';
import { StudentDashboardComponent } from '../../pages/student-dashboard/student-dashboard.component';
import { StudentScheduleComponent } from '../../pages/student-schedule/student-schedule.component';
import { MyGradesComponent } from '../../pages/my-grades/my-grades.component';
import { MyEventsComponent } from '../../pages/my-events/my-events.component';
import { MyProfileComponent } from '../../pages/my-profile/my-profile.component';
import { CourseRegistrationComponent } from '../../pages/course-registration/course-registration.component';

@Component({
  selector: 'app-student-layout',
  templateUrl: './student-layout.component.html',
  imports: [StudentDashboardComponent, StudentScheduleComponent, MyGradesComponent, MyEventsComponent, MyProfileComponent, CourseRegistrationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class StudentLayoutComponent {
  private elementRef = inject(ElementRef);
  activePage = signal('Dashboard');
  isProfileOpen = signal(false);

  menuItems = signal([
    { label: 'Dashboard', active: true },
    { label: 'Schedule', active: false },
    { label: 'Grades', active: false },
    { label: 'Course Registration', active: false },
    { label: 'Events', active: false },
  ]);

  setActivePage(pageLabel: string, event: MouseEvent) {
    event.preventDefault();
    if (this.activePage() === pageLabel) return;

    this.activePage.set(pageLabel);
    this.menuItems.update(items => items.map(item => ({
      ...item,
      active: item.label === pageLabel
    })));
  }

  toggleProfile(event: MouseEvent) {
    event.stopPropagation();
    this.isProfileOpen.update(v => !v);
  }

  onDocumentClick(event: MouseEvent) {
    const profileDropdown = this.elementRef.nativeElement.querySelector('.profile-dropdown');
    if (profileDropdown && !profileDropdown.contains(event.target)) {
      this.isProfileOpen.set(false);
    }
  }
}
