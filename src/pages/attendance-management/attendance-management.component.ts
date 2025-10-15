import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, User, StudentAttendance, AttendanceStatus } from '../../services/data.service';

@Component({
  selector: 'app-attendance-management',
  templateUrl: './attendance-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class AttendanceManagementComponent implements OnInit {
  private dataService = inject(DataService);

  // State Signals
  teacherClasses = this.dataService.getTeacherClasses();
  private allUsers = this.dataService.getUsers();
  private allGradebooks = this.dataService.getGradebooks();
  private allAttendance = this.dataService.getAttendanceRecords();
  
  selectedClassId = signal<number>(0);
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  
  // A map to track local changes before saving
  private attendanceChanges = signal<Map<number, AttendanceStatus>>(new Map());

  // Derived/Computed Signals
  isDirty = computed(() => this.attendanceChanges().size > 0);
  
  studentsInSelectedClass = computed(() => {
    const classId = this.selectedClassId();
    if (!classId) return [];
    
    const gradebook = this.allGradebooks().find(gb => gb.classId === classId);
    if (!gradebook) return [];

    const studentIds = gradebook.entries.map(e => e.studentId);
    return this.allUsers().filter(u => studentIds.includes(u.id));
  });

  currentAttendance = computed(() => {
    const classId = this.selectedClassId();
    const date = this.selectedDate();
    const attendanceRecord = this.allAttendance().find(r => r.classId === classId && r.date === date);
    
    const attendanceMap = new Map<number, AttendanceStatus>();
    if (attendanceRecord) {
      attendanceRecord.records.forEach(r => attendanceMap.set(r.studentId, r.status));
    }
    return attendanceMap;
  });

  tableData = computed(() => {
    const students = this.studentsInSelectedClass();
    const savedAttendance = this.currentAttendance();
    const localChanges = this.attendanceChanges();

    return students.map(student => {
      // For a new record, default to Present, otherwise use changed or saved status
      const defaultStatus: AttendanceStatus = savedAttendance.size > 0 ? 'Present' : 'Present'; 
      const status = localChanges.get(student.id) ?? savedAttendance.get(student.id) ?? defaultStatus;
      return {
        student,
        status
      };
    });
  });

  ngOnInit() {
    // Set initial class if available
    if (this.teacherClasses().length > 0) {
      this.selectedClassId.set(this.teacherClasses()[0].id);
    }
  }

  // Methods
  selectClass(event: Event) {
    const classId = Number((event.target as HTMLSelectElement).value);
    if (this.isDirty() && !confirm('You have unsaved changes. Are you sure you want to switch classes?')) {
      // Revert the select element's value if user cancels
      (event.target as HTMLSelectElement).value = this.selectedClassId().toString();
      return;
    }
    this.selectedClassId.set(classId);
    this.attendanceChanges.set(new Map()); // Discard changes
  }

  onDateChange(event: Event) {
    const newDate = (event.target as HTMLInputElement).value;
    if (this.isDirty() && !confirm('You have unsaved changes. Are you sure you want to change the date?')) {
      (event.target as HTMLInputElement).value = this.selectedDate();
      return;
    }
    this.selectedDate.set(newDate);
    this.attendanceChanges.set(new Map()); // Discard changes
  }
  
  setStatus(studentId: number, status: AttendanceStatus) {
    this.attendanceChanges.update(changes => {
      const newChanges = new Map(changes);
      newChanges.set(studentId, status);
      return newChanges;
    });
  }

  markAll(status: AttendanceStatus) {
    this.attendanceChanges.update(changes => {
      const newChanges = new Map(changes);
      this.studentsInSelectedClass().forEach(student => {
        newChanges.set(student.id, status);
      });
      return newChanges;
    });
  }

  saveAttendance() {
    const classId = this.selectedClassId();
    if (!classId || !this.isDirty()) return;

    const newRecords: StudentAttendance[] = this.tableData().map(({ student, status }) => ({
      studentId: student.id,
      status: status
    }));

    this.dataService.updateAttendanceRecords(classId, this.selectedDate(), newRecords);
    this.attendanceChanges.set(new Map()); // Reset changes
    // Optionally show a success toast message
  }

  getStatusStyles(status: AttendanceStatus) {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
