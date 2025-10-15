import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AdminDashboardComponent } from '../../pages/admin-dashboard/admin-dashboard.component';
import { WarehouseManagementComponent } from '../../pages/warehouse-management/warehouse-management.component';
import { CourseManagementComponent } from '../../pages/course-management/course-management.component';
import { UserManagementComponent } from '../../pages/user-management/user-management.component';
import { CommonModule } from '@angular/common';
import { MyProfileComponent } from '../../pages/my-profile/my-profile.component';

// FIX: Added OnPush change detection strategy for performance.
@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SidebarComponent, HeaderComponent, AdminDashboardComponent, WarehouseManagementComponent, CourseManagementComponent, UserManagementComponent, MyProfileComponent],
})
export class AdminLayoutComponent {
  sidebarOpen = signal(true);
  activePage = signal('Dashboard');

  adminMenuItems = signal([
    { label: 'Dashboard', icon: 'dashboard', active: true },
    { label: 'User Management', icon: 'users', active: false },
    { label: 'Course Management', icon: 'courses', active: false },
    { label: 'Warehouse', icon: 'warehouse', active: false },
    { label: 'Reports', icon: 'reports', active: false },
    { label: 'Settings', icon: 'settings', active: false },
  ]);

  breadcrumbs = computed(() => ['Admin', this.activePage()]);

  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }
  
  setActivePage(pageLabel: string) {
    if (this.activePage() === pageLabel) return;

    this.activePage.set(pageLabel);
    this.adminMenuItems.update(items => items.map(item => ({
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
