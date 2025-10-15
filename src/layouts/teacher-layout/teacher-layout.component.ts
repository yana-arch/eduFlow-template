import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { TeacherDashboardComponent } from '../../pages/teacher-dashboard/teacher-dashboard.component';
import { GradebookManagementComponent } from '../../pages/gradebook-management/gradebook-management.component';
import { AttendanceManagementComponent } from '../../pages/attendance-management/attendance-management.component';
import { CommonModule } from '@angular/common';
import { WarehouseManagementComponent } from '../../pages/warehouse-management/warehouse-management.component';
import { TeacherScheduleComponent } from '../../pages/teacher-schedule/teacher-schedule.component';
import { MyProfileComponent } from '../../pages/my-profile/my-profile.component';

// FIX: Added OnPush change detection strategy for performance.
@Component({
  selector: 'app-teacher-layout',
  templateUrl: './teacher-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SidebarComponent, HeaderComponent, TeacherDashboardComponent, GradebookManagementComponent, AttendanceManagementComponent, WarehouseManagementComponent, TeacherScheduleComponent, MyProfileComponent],
})
export class TeacherLayoutComponent {
  sidebarOpen = signal(true);
  activePage = signal('My Classes');

  teacherMenuItems = signal([
    { label: 'My Classes', icon: 'courses', active: true },
    { label: 'Schedule', icon: 'schedule', active: false },
    { label: 'Gradebook', icon: 'gradebook', active: false },
    { label: 'Attendance', icon: 'attendance', active: false },
    { label: 'Inventory', icon: 'warehouse', active: false },
  ]);

  breadcrumbs = computed(() => ['Teacher', this.activePage()]);

  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }

  setActivePage(pageLabel: string) {
    if (this.activePage() === pageLabel) return;
    
    this.activePage.set(pageLabel);
    this.teacherMenuItems.update(items => items.map(item => ({
      ...item,
      active: item.label === pageLabel
    })));
  }

  handleProfileNavigation(item: string) {
    if (item === 'Profile') {
      this.setActivePage('My Profile');
    }
  }
}
