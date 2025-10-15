import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { TeacherLayoutComponent } from './layouts/teacher-layout/teacher-layout.component';
import { StudentLayoutComponent } from './layouts/student-layout/student-layout.component';
import { CommonModule } from '@angular/common';

export type UserRole = 'admin' | 'teacher' | 'student';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminLayoutComponent, TeacherLayoutComponent, StudentLayoutComponent, CommonModule],
})
export class AppComponent {
  currentRole = signal<UserRole>('admin');
  
  roles: { id: UserRole, name: string }[] = [
    { id: 'admin', name: 'Admin View' },
    { id: 'teacher', name: 'Teacher View' },
    { id: 'student', name: 'Student View' },
  ];

  setRole(role: UserRole) {
    this.currentRole.set(role);
  }
}
