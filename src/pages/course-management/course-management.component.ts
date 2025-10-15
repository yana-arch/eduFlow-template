import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService, Course } from '../../services/data.service';

@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule],
})
export class CourseManagementComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private dataService = inject(DataService);

  // State
  courses = this.dataService.getCourses();
  searchTerm = signal('');
  isModalOpen = signal(false);
  editingCourse = signal<Course | null>(null);
  
  courseForm = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    department: ['', Validators.required],
    credits: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    instructor: ['', Validators.required],
  });

  // Derived State
  filteredCourses = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.courses();
    }
    return this.courses().filter(course => 
      course.name.toLowerCase().includes(term) || 
      course.code.toLowerCase().includes(term) ||
      course.department.toLowerCase().includes(term) ||
      course.instructor.toLowerCase().includes(term)
    );
  });
  
  totalCourses = computed(() => this.courses().length);
  totalDepartments = computed(() => new Set(this.courses().map(c => c.department)).size);
  totalCreditsOffered = computed(() => this.courses().reduce((acc, course) => acc + course.credits, 0));

  // Methods
  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openModal(course: Course | null = null) {
    this.editingCourse.set(course);
    if (course) {
      this.courseForm.patchValue(course);
    } else {
      this.courseForm.reset({
        name: '', code: '', department: '', credits: 3, instructor: ''
      });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingCourse.set(null);
    this.courseForm.reset();
  }

  saveCourse() {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    const formValue = this.courseForm.getRawValue();
    const courseData = {
      name: formValue.name!,
      code: formValue.code!,
      department: formValue.department!,
      credits: formValue.credits!,
      instructor: formValue.instructor!,
    };

    if (this.editingCourse()) {
      this.dataService.updateCourse({ ...this.editingCourse()!, ...courseData });
    } else {
      this.dataService.addCourse(courseData);
    }

    this.closeModal();
  }

  deleteCourse(id: number, event: MouseEvent) {
    event.stopPropagation();
    if(confirm('Are you sure you want to delete this course?')) {
      this.dataService.deleteCourse(id);
    }
  }
}
