import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, User, Gradebook } from '../../services/data.service';

@Component({
  selector: 'app-gradebook-management',
  templateUrl: './gradebook-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class GradebookManagementComponent {
  private dataService = inject(DataService);
  
  // Signals for state management
  teacherClasses = this.dataService.getTeacherClasses();
  private allUsers = this.dataService.getUsers();
  private gradebooks = this.dataService.getGradebooks();
  private gradePoints = this.dataService.getGradePoints();

  selectedClassId = signal<number>(this.teacherClasses()[0]?.id || 0);
  isAddAssignmentModalOpen = signal(false);
  newAssignmentName = signal('');
  
  // A map to track changes: key is 'studentId-assignmentName', value is the new grade
  private gradeChanges = signal<Map<string, string | number>>(new Map());
  private validationErrors = signal<Map<string, string>>(new Map());

  // Computed properties for derived state
  isDirty = computed(() => this.gradeChanges().size > 0);
  hasErrors = computed(() => this.validationErrors().size > 0);

  selectedGradebook = computed(() => {
    return this.gradebooks().find(gb => gb.classId === this.selectedClassId());
  });

  private studentMap = computed(() => {
    const map = new Map<number, User>();
    this.allUsers().forEach(user => map.set(user.id, user));
    return map;
  });

  // Methods
  selectClass(classId: number) {
    if (this.isDirty() && !confirm('You have unsaved changes. Are you sure you want to switch classes?')) {
      return;
    }
    this.selectedClassId.set(classId);
    this.gradeChanges.set(new Map()); // Discard changes when switching
    this.validationErrors.set(new Map()); // Also discard errors
  }

  getStudentById(id: number): User | undefined {
    return this.studentMap().get(id);
  }

  getGradeForInput(studentId: number, assignment: string): string | number {
    const changeKey = `${studentId}-${assignment}`;
    if (this.gradeChanges().has(changeKey)) {
      return this.gradeChanges().get(changeKey)!;
    }
    const entry = this.selectedGradebook()?.entries.find(e => e.studentId === studentId);
    const grade = entry?.grades[assignment];
    return grade ?? '';
  }

  onGradeInput(event: Event, studentId: number, assignment: string) {
    const value = (event.target as HTMLInputElement).value;
    const changeKey = `${studentId}-${assignment}`;
    
    this.gradeChanges.update(currentMap => new Map(currentMap).set(changeKey, value));
    this.validateGrade(value, changeKey);
  }

  private validateGrade(value: string, key: string) {
    const trimmedValue = value.trim();
    
    // An empty string is considered valid (not graded yet)
    if (trimmedValue === '') {
      this.validationErrors.update(errors => {
        const newErrors = new Map(errors);
        newErrors.delete(key);
        return newErrors;
      });
      return;
    }

    const numericValue = Number(trimmedValue);
    const validLetterGrades = Object.keys(this.gradePoints);

    if (!isNaN(numericValue) && trimmedValue !== '') {
      // It's a number
      if (numericValue < 0 || numericValue > 100) {
        this.validationErrors.update(errors => new Map(errors).set(key, 'Must be 0-100'));
      } else {
        this.validationErrors.update(errors => {
          const newErrors = new Map(errors);
          newErrors.delete(key);
          return newErrors;
        });
      }
    } else {
      // It's a string, check if it's a valid letter grade (case-insensitive)
      if (validLetterGrades.includes(trimmedValue.toUpperCase())) {
        this.validationErrors.update(errors => {
          const newErrors = new Map(errors);
          newErrors.delete(key);
          return newErrors;
        });
      } else {
        this.validationErrors.update(errors => new Map(errors).set(key, 'Invalid grade'));
      }
    }
  }

  getValidationError(studentId: number, assignment: string): string | undefined {
    return this.validationErrors().get(`${studentId}-${assignment}`);
  }

  saveChanges() {
    if (this.hasErrors()) {
      alert('Please fix the validation errors before saving.');
      return;
    }
    const currentGradebook = this.selectedGradebook();
    if (!currentGradebook) return;

    // Create a deep copy to avoid direct mutation
    const updatedGradebook: Gradebook = JSON.parse(JSON.stringify(currentGradebook));
    const validLetterGrades = Object.keys(this.gradePoints);

    // Apply changes from the gradeChanges map
    this.gradeChanges().forEach((value, key) => {
      const [studentIdStr, assignment] = key.split('-');
      const studentId = Number(studentIdStr);
      const entry = updatedGradebook.entries.find(e => e.studentId === studentId);

      if (entry) {
        const trimmedValue = String(value).trim();
        const numericValue = Number(trimmedValue);

        if (trimmedValue === '') {
          entry.grades[assignment] = null;
        } else if (!isNaN(numericValue) && trimmedValue !== '') {
          entry.grades[assignment] = numericValue;
        } else if (validLetterGrades.includes(trimmedValue.toUpperCase())) {
          entry.grades[assignment] = trimmedValue.toUpperCase();
        }
      }
    });

    this.dataService.updateGradebook(updatedGradebook);
    this.gradeChanges.set(new Map()); // Reset changes
    this.validationErrors.set(new Map()); // Reset errors
  }
  
  openAddAssignmentModal() {
    this.newAssignmentName.set('');
    this.isAddAssignmentModalOpen.set(true);
  }

  closeAddAssignmentModal() {
    this.isAddAssignmentModalOpen.set(false);
  }

  addAssignment() {
    const name = this.newAssignmentName().trim();
    if (name && this.selectedClassId()) {
      this.dataService.addAssignmentToGradebook(this.selectedClassId(), name);
      this.closeAddAssignmentModal();
    }
  }
}
