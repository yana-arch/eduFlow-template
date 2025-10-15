import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Course } from '../../services/data.service';

@Component({
  selector: 'app-course-registration',
  templateUrl: './course-registration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class CourseRegistrationComponent implements OnInit {
  private dataService = inject(DataService);

  // In a real app, this would come from an auth service
  private currentStudentId = 3; 

  allCourses = this.dataService.getCourses();
  
  enrolledCourseIds = signal<Set<number>>(new Set());
  selectedCourseIds = signal<Set<number>>(new Set());

  ngOnInit() {
    // Initialize with the student's current enrollments
    const initialEnrollments = this.dataService.getStudentEnrollments(this.currentStudentId);
    this.enrolledCourseIds.set(new Set(initialEnrollments));
  }

  isEnrolled(courseId: number): boolean {
    return this.enrolledCourseIds().has(courseId);
  }

  isSelected(courseId: number): boolean {
    return this.selectedCourseIds().has(courseId);
  }

  isFull(course: Course): boolean {
    return course.enrolled >= course.capacity;
  }

  toggleSelection(course: Course) {
    if (this.isEnrolled(course.id) || this.isFull(course)) {
      return; // Cannot select already enrolled or full courses
    }

    this.selectedCourseIds.update(currentSelection => {
      const newSelection = new Set(currentSelection);
      if (newSelection.has(course.id)) {
        newSelection.delete(course.id);
      } else {
        newSelection.add(course.id);
      }
      return newSelection;
    });
  }

  confirmRegistration() {
    if (this.selectedCourseIds().size === 0) return;
    
    const courseIdsToRegister = Array.from(this.selectedCourseIds());
    const result = this.dataService.registerForCourses(this.currentStudentId, courseIdsToRegister);

    if (result.success) {
      // Update local state to reflect successful registration
      this.enrolledCourseIds.update(currentEnrolled => {
        const newEnrolled = new Set(currentEnrolled);
        courseIdsToRegister.forEach(id => newEnrolled.add(id));
        return newEnrolled;
      });
      // Clear the selection
      this.selectedCourseIds.set(new Set());
      alert('Registration successful!');
    } else {
      alert(`Registration failed: ${result.message}`);
    }
  }

  getDepartmentColor(department: string): string {
    const colors: { [key: string]: string } = {
      'Computer Science': 'border-blue-500',
      'Mathematics': 'border-indigo-500',
      'Physics': 'border-purple-500',
      'History': 'border-amber-500',
      'Chemistry': 'border-rose-500',
    };
    return colors[department] || 'border-gray-500';
  }
}
