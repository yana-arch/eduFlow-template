import { Injectable, signal } from '@angular/core';

// --- INTERFACES ---

export interface WarehouseItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
}

export type UserRole = 'Admin' | 'Teacher' | 'Student';
export type UserStatus = 'Active' | 'Inactive' | 'Pending';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  createdAt: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  department: string;
  credits: number;
  instructor: string;
  capacity: number;
  enrolled: number;
}

export interface SchoolEvent {
  id: number;
  name: string;
  category: 'Career' | 'Academic' | 'Social' | 'Workshop';
  date: string;
  location: string;
  description: string;
  capacity: number;
  registered: number;
  isRegistered: boolean;
  imageUrl: string;
}

export interface Grade {
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  semester: string;
}

export interface ScheduleItem {
  id: number;
  courseName: string;
  teacher: string;
  room: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  color: string;
  studentIds: number[];
}

export interface TransactionItem {
  itemId: number;
  itemName: string;
  quantity: number;
}

export type TransactionType = 'Import' | 'Export';
export type TransactionStatus = 'Pending' | 'Approved' | 'Rejected';

export interface WarehouseTransaction {
  id: number;
  type: TransactionType;
  date: string;
  user: string;
  items: TransactionItem[];
  status: TransactionStatus;
}

export interface TeacherClass {
  id: number;
  name: string;
  students: number;
  room: string;
  period: string;
  color: string;
  progress: number;
  subjectIcon: string;
}

export interface GradebookEntry {
  studentId: number;
  grades: { [assignmentName: string]: number | string | null };
}

export interface Gradebook {
  classId: number;
  className: string;
  assignments: string[]; // Ordered list of assignment names
  entries: GradebookEntry[];
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface StudentAttendance {
  studentId: number;
  status: AttendanceStatus;
}

export interface AttendanceRecord {
  classId: number;
  date: string; // YYYY-MM-DD
  records: StudentAttendance[];
}


// --- SERVICE ---

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // --- WAREHOUSE DATA ---
  private warehouseItemsSignal = signal<WarehouseItem[]>([
    { id: 1, name: 'Beakers (Set of 5)', sku: 'CHEM-BK-001', category: 'Chemistry', quantity: 30, price: 25.99 },
    { id: 2, name: 'Microscope Slides (100-pack)', sku: 'BIO-MS-001', category: 'Biology', quantity: 20, price: 15.50 },
    { id: 3, name: 'Digital Multimeter', sku: 'PHY-DM-001', category: 'Physics', quantity: 10, price: 45.00 },
    { id: 4, name: 'Bunsen Burner', sku: 'CHEM-BB-001', category: 'Chemistry', quantity: 15, price: 30.25 },
    { id: 5, name: 'Dissection Kit', sku: 'BIO-DK-001', category: 'Biology', quantity: 30, price: 22.00 },
    { id: 6, name: 'Test Tubes (50-pack)', sku: 'CHEM-TT-001', category: 'Chemistry', quantity: 150, price: 12.00 },
    { id: 7, name: 'Safety Goggles (10-pack)', sku: 'GEN-SG-001', category: 'General', quantity: 5, price: 18.75 },
    { id: 8, name: 'Laser Optics Kit', sku: 'PHY-LO-001', category: 'Physics', quantity: 12, price: 120.00 },
  ]);
  
  private warehouseTransactionsSignal = signal<WarehouseTransaction[]>([
    { id: 1, type: 'Import', date: '2024-07-15', user: 'John Doe', items: [{ itemId: 1, itemName: 'Beakers (Set of 5)', quantity: 20 }], status: 'Approved' },
    { id: 2, type: 'Export', date: '2024-07-16', user: 'Frank Noten', items: [{ itemId: 3, itemName: 'Digital Multimeter', quantity: 2 }], status: 'Approved' },
    { id: 3, type: 'Import', date: '2024-07-20', user: 'John Doe', items: [{ itemId: 7, itemName: 'Safety Goggles (10-pack)', quantity: 10 }], status: 'Pending' },
    { id: 4, type: 'Export', date: '2024-07-21', user: 'Jane Smith', items: [{ itemId: 4, itemName: 'Bunsen Burner', quantity: 5 }], status: 'Rejected' },
  ]);
  
  getWarehouseItems() { return this.warehouseItemsSignal.asReadonly(); }
  getWarehouseTransactions() { return this.warehouseTransactionsSignal.asReadonly(); }
  
  addWarehouseItem(item: Omit<WarehouseItem, 'id'>) {
    const newId = this.warehouseItemsSignal().length > 0 ? Math.max(...this.warehouseItemsSignal().map(i => i.id)) + 1 : 1;
    this.warehouseItemsSignal.update(items => [...items, { id: newId, ...item }]);
  }

  updateWarehouseItem(updatedItem: WarehouseItem) {
    this.warehouseItemsSignal.update(items => items.map(i => i.id === updatedItem.id ? updatedItem : i));
  }

  deleteWarehouseItem(id: number) {
    this.warehouseItemsSignal.update(items => items.filter(i => i.id !== id));
  }

  addWarehouseTransaction(transaction: Omit<WarehouseTransaction, 'id' | 'date' | 'user' | 'status'>) {
    const newId = this.warehouseTransactionsSignal().length > 0 ? Math.max(...this.warehouseTransactionsSignal().map(t => t.id)) + 1 : 1;
    const newTransaction: WarehouseTransaction = {
      id: newId,
      ...transaction,
      date: new Date().toISOString().split('T')[0],
      user: 'John Doe', // Mock user for demo
      status: 'Pending' // New transactions are now pending approval
    };
    
    this.warehouseTransactionsSignal.update(transactions => [...transactions, newTransaction]);
  }

  updateTransactionStatus(transactionId: number, newStatus: 'Approved' | 'Rejected'): { success: boolean, message?: string } {
    const transaction = this.warehouseTransactionsSignal().find(t => t.id === transactionId);

    if (!transaction || transaction.status !== 'Pending') {
      return { success: false, message: 'Transaction not found or already processed.' };
    }

    if (newStatus === 'Rejected') {
      this.warehouseTransactionsSignal.update(transactions =>
        transactions.map(t => t.id === transactionId ? { ...t, status: 'Rejected' } : t)
      );
      return { success: true };
    }

    // Handle Approval
    if (transaction.type === 'Export') {
      for (const item of transaction.items) {
        const stockItem = this.warehouseItemsSignal().find(i => i.id === item.itemId);
        if (!stockItem || stockItem.quantity < item.quantity) {
          return { success: false, message: `Approval failed: Not enough stock for ${item.itemName}. Available: ${stockItem?.quantity || 0}` };
        }
      }
    }

    // All checks passed, update stock
    this.warehouseItemsSignal.update(currentItems => {
      return currentItems.map(stockItem => {
        const transactionItem = transaction.items.find(ti => ti.itemId === stockItem.id);
        if (transactionItem) {
          const newQuantity = transaction.type === 'Import'
            ? stockItem.quantity + transactionItem.quantity
            : stockItem.quantity - transactionItem.quantity;
          return { ...stockItem, quantity: newQuantity };
        }
        return stockItem;
      });
    });

    // Update transaction status to Approved
    this.warehouseTransactionsSignal.update(transactions =>
      transactions.map(t => t.id === transactionId ? { ...t, status: 'Approved' } : t)
    );

    return { success: true };
  }
  
  // --- USER DATA ---
  private usersSignal = signal<User[]>([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', status: 'Active', avatar: 'https://picsum.photos/id/1005/200/200', createdAt: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Teacher', status: 'Active', avatar: 'https://picsum.photos/id/1011/200/200', createdAt: '2023-02-20' },
    { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Student', status: 'Active', avatar: 'https://picsum.photos/id/1012/200/200', createdAt: '2023-09-01' },
    { id: 4, name: 'Mary Williams', email: 'mary.williams@example.com', role: 'Teacher', status: 'Inactive', avatar: 'https://picsum.photos/id/1013/200/200', createdAt: '2023-03-10' },
    { id: 5, name: 'David Brown', email: 'david.brown@example.com', role: 'Student', status: 'Pending', avatar: 'https://picsum.photos/id/1014/200/200', createdAt: '2023-09-05' },
    { id: 6, name: 'Laura Taylor', email: 'laura.taylor@example.com', role: 'Student', status: 'Active', avatar: 'https://picsum.photos/id/1015/200/200', createdAt: '2023-09-02' },
  ]);

  getUsers() { return this.usersSignal.asReadonly(); }

  addUser(user: Omit<User, 'id' | 'avatar' | 'createdAt'>) {
    const newId = this.usersSignal().length > 0 ? Math.max(...this.usersSignal().map(u => u.id)) + 1 : 1;
    const newUser: User = { 
        id: newId, 
        ...user, 
        avatar: `https://picsum.photos/id/${1015 + newId}/200/200`,
        createdAt: new Date().toISOString().split('T')[0]
    };
    this.usersSignal.update(users => [...users, newUser]);
  }

  updateUser(updatedUser: User) {
    this.usersSignal.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
  }

  deleteUser(id: number) {
    this.usersSignal.update(users => users.filter(u => u.id !== id));
  }

  // --- COURSE DATA ---
  private coursesSignal = signal<Course[]>([
    { id: 1, name: 'Introduction to Computer Science', code: 'CS101', department: 'Computer Science', credits: 3, instructor: 'Dr. Alan Turing', capacity: 50, enrolled: 45 },
    { id: 2, name: 'Calculus I', code: 'MATH101', department: 'Mathematics', credits: 4, instructor: 'Dr. Isaac Newton', capacity: 40, enrolled: 38 },
    { id: 3, name: 'General Physics', code: 'PHY101', department: 'Physics', credits: 4, instructor: 'Dr. Albert Einstein', capacity: 60, enrolled: 60 },
    { id: 4, name: 'World History', code: 'HIST101', department: 'History', credits: 3, instructor: 'Prof. H. G. Wells', capacity: 35, enrolled: 30 },
    { id: 5, name: 'Organic Chemistry', code: 'CHEM201', department: 'Chemistry', credits: 4, instructor: 'Dr. Marie Curie', capacity: 30, enrolled: 25 },
    { id: 6, name: 'Data Structures and Algorithms', code: 'CS202', department: 'Computer Science', credits: 3, instructor: 'Prof. Ada Lovelace', capacity: 50, enrolled: 33 },
    { id: 7, name: 'Linear Algebra', code: 'MATH202', department: 'Mathematics', credits: 3, instructor: 'Dr. Emmy Noether', capacity: 40, enrolled: 15 },
  ]);
  
  private studentEnrollments = signal<Map<number, number[]>>(new Map([
    // studentId -> [courseId, courseId, ...]
    [3, [2, 5]] // Peter Jones is enrolled in Calculus I and Organic Chemistry
  ]));

  getCourses() { return this.coursesSignal.asReadonly(); }
  getStudentEnrollments(studentId: number): number[] {
    return this.studentEnrollments().get(studentId) || [];
  }

  addCourse(course: Omit<Course, 'id'>) {
    const newId = this.coursesSignal().length > 0 ? Math.max(...this.coursesSignal().map(c => c.id)) + 1 : 1;
    this.coursesSignal.update(courses => [...courses, { id: newId, ...course }]);
  }

  updateCourse(updatedCourse: Course) {
     this.coursesSignal.update(courses => courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  }
  
  deleteCourse(id: number) {
     this.coursesSignal.update(courses => courses.filter(c => c.id !== id));
  }

  registerForCourses(studentId: number, courseIds: number[]): { success: boolean; message: string } {
    const currentCourses = this.coursesSignal();
    const studentEnrollments = this.studentEnrollments();
    const currentStudentEnrollments = new Set(studentEnrollments.get(studentId) || []);

    // Validation phase
    for (const courseId of courseIds) {
      const course = currentCourses.find(c => c.id === courseId);
      if (!course) {
        return { success: false, message: `Course with ID ${courseId} not found.` };
      }
      if (course.enrolled >= course.capacity) {
        return { success: false, message: `Course "${course.name}" is full.` };
      }
      if (currentStudentEnrollments.has(courseId)) {
        // This case should ideally be prevented by the UI, but it's good to have a backend check
        return { success: false, message: `You are already registered for "${course.name}".`};
      }
    }

    // Update phase
    this.coursesSignal.update(courses => {
      return courses.map(course => {
        if (courseIds.includes(course.id)) {
          return { ...course, enrolled: course.enrolled + 1 };
        }
        return course;
      });
    });

    this.studentEnrollments.update(enrollments => {
      const newEnrollments = new Map(enrollments);
      const updatedStudentCourses = [...(newEnrollments.get(studentId) || []), ...courseIds];
      newEnrollments.set(studentId, updatedStudentCourses);
      return newEnrollments;
    });

    return { success: true, message: 'Registration successful!' };
  }


  // --- SCHOOL EVENTS DATA ---
  private schoolEventsSignal = signal<SchoolEvent[]>([
    { id: 1, name: 'Annual Career Fair', category: 'Career', date: '2024-11-10', location: 'Main Auditorium', description: 'Connect with top employers from various industries.', capacity: 200, registered: 150, isRegistered: false, imageUrl: 'https://picsum.photos/seed/career/400/200' },
    { id: 2, name: 'Guest Lecture: The Future of AI', category: 'Academic', date: '2024-11-15', location: 'Science Hall - Room 101', description: 'A talk by Dr. Evelyn Reed on the ethical implications of advanced AI.', capacity: 80, registered: 78, isRegistered: true, imageUrl: 'https://picsum.photos/seed/ai/400/200' },
    { id: 3, name: 'Fall Semester Hackathon', category: 'Workshop', date: '2024-11-18', location: 'Computer Science Building', description: 'A 24-hour coding competition with exciting prizes.', capacity: 50, registered: 50, isRegistered: false, imageUrl: 'https://picsum.photos/seed/hackathon/400/200' },
    { id: 4, name: 'Student Social Mixer', category: 'Social', date: '2024-11-22', location: 'Student Union Courtyard', description: 'Meet new people, enjoy free food, and relax before finals.', capacity: 150, registered: 88, isRegistered: false, imageUrl: 'https://picsum.photos/seed/social/400/200' },
    { id: 5, name: 'Public Speaking Workshop', category: 'Workshop', date: '2024-11-25', location: 'Library - Room 3', description: 'Improve your presentation skills with hands-on practice.', capacity: 25, registered: 10, isRegistered: true, imageUrl: 'https://picsum.photos/seed/workshop/400/200' },
    { id: 6, name: 'Alumni Networking Night', category: 'Career', date: '2024-12-02', location: 'Grand Ballroom', description: 'An exclusive event to network with successful alumni.', capacity: 100, registered: 95, isRegistered: false, imageUrl: 'https://picsum.photos/seed/alumni/400/200' },
  ]);

  getSchoolEvents() { return this.schoolEventsSignal.asReadonly(); }

  toggleEventRegistration(eventId: number) {
    this.schoolEventsSignal.update(currentEvents =>
      currentEvents.map(event => {
        if (event.id === eventId) {
          if (event.isRegistered) {
            return { ...event, isRegistered: false, registered: event.registered - 1 };
          } else if (event.registered < event.capacity) {
            return { ...event, isRegistered: true, registered: event.registered + 1 };
          }
        }
        return event;
      })
    );
  }

  // --- GRADES DATA ---
  private allGradesSignal = signal<Grade[]>([
    { courseCode: 'CS101', courseName: 'Introduction to Programming', credits: 3, grade: 'A', semester: 'Fall 2023' },
    { courseCode: 'MA101', courseName: 'Calculus I', credits: 4, grade: 'B+', semester: 'Fall 2023' },
    { courseCode: 'PHY101', courseName: 'General Physics I', credits: 4, grade: 'A-', semester: 'Fall 2023' },
    { courseCode: 'EN101', courseName: 'English Composition', credits: 3, grade: 'B', semester: 'Fall 2023' },
    { courseCode: 'CS201', courseName: 'Data Structures', credits: 3, grade: 'A', semester: 'Spring 2024' },
    { courseCode: 'MA201', courseName: 'Calculus II', credits: 4, grade: 'A', semester: 'Spring 2024' },
    { courseCode: 'CH101', courseName: 'General Chemistry I', credits: 4, grade: 'B+', semester: 'Spring 2024' },
    { courseCode: 'HI101', courseName: 'World History', credits: 3, grade: 'C+', semester: 'Spring 2024' },
  ]);
  
  private gradePoints = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };

  getAllGrades() { return this.allGradesSignal.asReadonly(); }
  getGradePoints() { return this.gradePoints; }
  
  // --- SCHEDULE DATA ---
  private scheduleItemsSignal = signal<ScheduleItem[]>([
    { id: 1, courseName: 'Calculus II', teacher: 'Dr. Alan Turing', room: 'Room 303', day: 'Monday', startTime: '10:00', endTime: '11:30', color: 'blue', studentIds: [3, 5] },
    { id: 2, courseName: 'Data Structures', teacher: 'Prof. Ada Lovelace', room: 'CS Lab 1', day: 'Monday', startTime: '13:00', endTime: '14:30', color: 'indigo', studentIds: [3, 6] },
    { id: 3, courseName: 'Modern Physics', teacher: 'Dr. Marie Curie', room: 'Lab A', day: 'Tuesday', startTime: '09:00', endTime: '10:30', color: 'purple', studentIds: [6] },
    { id: 4, courseName: 'World History', teacher: 'Prof. H. Wells', room: 'Hall 2', day: 'Tuesday', startTime: '14:00', endTime: '15:30', color: 'amber', studentIds: [5, 6] },
    { id: 5, courseName: 'Calculus II', teacher: 'Dr. Alan Turing', room: 'Room 303', day: 'Wednesday', startTime: '10:00', endTime: '11:30', color: 'blue', studentIds: [3, 5] },
    { id: 6, courseName: 'General Chemistry', teacher: 'Dr. Rosalind Franklin', room: 'Chem Lab', day: 'Wednesday', startTime: '15:00', endTime: '17:00', color: 'rose', studentIds: [3, 5, 6] },
    { id: 7, courseName: 'Data Structures', teacher: 'Prof. Ada Lovelace', room: 'CS Lab 1', day: 'Thursday', startTime: '13:00', endTime: '14:30', color: 'indigo', studentIds: [3, 6] },
    { id: 8, courseName: 'Modern Physics', teacher: 'Dr. Marie Curie', room: 'Lab A', day: 'Friday', startTime: '09:00', endTime: '10:30', color: 'purple', studentIds: [6] },
  ]);

  getScheduleItems() { return this.scheduleItemsSignal.asReadonly(); }

  // --- ADMIN DASHBOARD DATA ---
  private adminDashboardStats = signal([
    { title: 'Total Students', value: '1,257', icon: 'users', change: 12, changeType: 'increase', color: 'blue' },
    { title: 'Total Revenue', value: '$50,240', icon: 'revenue', change: 13.8, changeType: 'increase', color: 'green' },
    { title: 'Upcoming Events', value: '8', icon: 'events', change: 2.1, changeType: 'decrease', color: 'yellow' },
    { title: 'Inventory Value', value: '$12,300', icon: 'inventory', change: 5, changeType: 'increase', color: 'indigo' },
  ]);
  private revenueData = signal([65, 59, 80, 81, 56, 55, 40, 84, 72, 90, 44, 62]);
  private attendanceData = signal([85, 88, 90, 92, 91, 89, 87, 93, 95, 94, 92, 91]);
  private recentActivity = signal([
    { user: 'Dr. Eleanor Vance', action: 'Added new course: "Advanced Quantum Physics"', details: 'PHY-401', timestamp: '2 minutes ago', status: 'Completed', statusColor: 'green', icon: 'add_course' },
    { user: 'Admin Office', action: 'Enrolled 50 new students for Fall 2024', details: 'Bulk Operation', timestamp: '1 hour ago', status: 'Completed', statusColor: 'green', icon: 'enroll_student' },
    { user: 'Frank Noten', action: 'Updated inventory for Chemistry Lab', details: 'Item #CHEM-052', timestamp: '3 hours ago', status: 'In Progress', statusColor: 'yellow', icon: 'update_inventory' },
    { user: 'Laura Smith', action: 'Approved budget request for Arts Department', details: '$5,000', timestamp: 'Yesterday', status: 'Approved', statusColor: 'blue', icon: 'approve_budget' },
    { user: 'System Maintenance', action: 'Scheduled system backup', details: 'Weekly Task', timestamp: 'Yesterday', status: 'Pending', statusColor: 'gray', icon: 'system_task' },
  ]);

  getAdminDashboardStats() { return this.adminDashboardStats.asReadonly(); }
  getRevenueData() { return this.revenueData.asReadonly(); }
  getAttendanceData() { return this.attendanceData.asReadonly(); }
  getRecentActivity() { return this.recentActivity.asReadonly(); }
  
  // --- TEACHER DASHBOARD DATA ---
  private teacherSchedule = signal([
    { time: '09:00 - 10:30', course: 'Calculus II', room: 'Room 301', type: 'Lecture', students: 45 },
    { time: '10:45 - 12:15', course: 'Modern Physics', room: 'Lab A', type: 'Lab Session', students: 22 },
    { time: '13:30 - 15:00', course: 'World History: 1900-Present', room: 'Room 112', type: 'Seminar', students: 30 },
    { time: '15:15 - 16:45', course: 'Introduction to Programming', room: 'CS Lab 3', type: 'Practical', students: 50 },
  ]);
  private teacherClasses = signal<TeacherClass[]>([
    { id: 1, name: 'Mathematic II', students: 3, room: 'Room 303', period: '1st Semester', color: 'blue', progress: 75, subjectIcon: 'calculator' },
    { id: 2, name: 'Physic I', students: 2, room: 'Lab A', period: '1st Semester', color: 'purple', progress: 50, subjectIcon: 'beaker' },
  ]);
  private attendance = signal([
    { id: 1, name: 'Alice Johnson', present: true },
    { id: 2, name: 'Bob Williams', present: true },
    { id: 3, name: 'Charlie Brown', present: false },
    { id: 4, name: 'Diana Miller', present: true },
    { id: 5, name: 'Ethan Davis', present: false },
  ]);

  getTeacherSchedule() { return this.teacherSchedule.asReadonly(); }
  getTeacherClasses() { return this.teacherClasses.asReadonly(); }
  getAttendance() { return this.attendance.asReadonly(); }
  updateAttendance(id: number, isPresent: boolean) {
    this.attendance.update(att => 
      att.map(student => 
        student.id === id ? { ...student, present: isPresent } : student
      )
    );
  }

  // --- GRADEBOOK DATA ---
  private gradebooksSignal = signal<Gradebook[]>([
    {
      classId: 1, // Mathematic II
      className: 'Mathematic II',
      assignments: ['Homework 1', 'Midterm Exam', 'Homework 2', 'Final Exam'],
      entries: [
        { studentId: 3, grades: { 'Homework 1': 95, 'Midterm Exam': 88, 'Homework 2': 92, 'Final Exam': null } }, // Peter Jones
        { studentId: 5, grades: { 'Homework 1': 80, 'Midterm Exam': 75, 'Homework 2': null, 'Final Exam': null } }, // David Brown
        { studentId: 6, grades: { 'Homework 1': 100, 'Midterm Exam': 94, 'Homework 2': 98, 'Final Exam': null } }, // Laura Taylor
      ]
    },
    {
      classId: 2, // Physic I
      className: 'Physic I',
      assignments: ['Lab Report 1', 'Quiz 1', 'Lab Report 2'],
      entries: [
        { studentId: 3, grades: { 'Lab Report 1': 'A-', 'Quiz 1': 85, 'Lab Report 2': 'B+' } }, // Peter Jones
        { studentId: 6, grades: { 'Lab Report 1': 'A', 'Quiz 1': 92, 'Lab Report 2': 'A-' } }, // Laura Taylor
      ]
    },
  ]);
  
  getGradebooks() { return this.gradebooksSignal.asReadonly(); }

  updateGradebook(updatedGradebook: Gradebook) {
    this.gradebooksSignal.update(gradebooks => 
      gradebooks.map(gb => gb.classId === updatedGradebook.classId ? updatedGradebook : gb)
    );
  }

  addAssignmentToGradebook(classId: number, assignmentName: string) {
    this.gradebooksSignal.update(gradebooks => gradebooks.map(gb => {
      if (gb.classId === classId) {
        // Add the new assignment to the list
        const newAssignments = [...gb.assignments, assignmentName];
        // Add a null entry for the new assignment for each student
        const newEntries = gb.entries.map(entry => ({
          ...entry,
          grades: {
            ...entry.grades,
            [assignmentName]: null
          }
        }));
        return { ...gb, assignments: newAssignments, entries: newEntries };
      }
      return gb;
    }));
  }

  // --- ATTENDANCE DATA ---
  private attendanceRecordsSignal = signal<AttendanceRecord[]>([
      {
        classId: 1, // Mathematic II
        date: new Date().toISOString().split('T')[0],
        records: [
          { studentId: 3, status: 'Present' },
          { studentId: 5, status: 'Present' },
          { studentId: 6, status: 'Absent' },
        ],
      },
      {
        classId: 1,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        records: [
          { studentId: 3, status: 'Present' },
          { studentId: 5, status: 'Late' },
          { studentId: 6, status: 'Present' },
        ],
      },
      {
        classId: 2, // Physic I
        date: new Date().toISOString().split('T')[0],
        records: [
          { studentId: 3, status: 'Present' },
          { studentId: 6, status: 'Excused' },
        ],
      }
  ]);

  getAttendanceRecords() { return this.attendanceRecordsSignal.asReadonly(); }

  updateAttendanceRecords(classId: number, date: string, newRecords: StudentAttendance[]) {
      this.attendanceRecordsSignal.update(allRecords => {
          const recordIndex = allRecords.findIndex(r => r.classId === classId && r.date === date);
          if (recordIndex > -1) {
              // Update existing record
              const updatedRecords = [...allRecords];
              updatedRecords[recordIndex] = { ...updatedRecords[recordIndex], records: newRecords };
              return updatedRecords;
          } else {
              // Add new record
              const newRecord: AttendanceRecord = { classId, date, records: newRecords };
              return [...allRecords, newRecord];
          }
      });
  }

  // --- STUDENT DASHBOARD DATA ---
  private upcomingClasses = signal([
    { name: 'Mathematic II', time: '10:00 AM - 11:30 AM', teacher: 'Dr. Alan Turing', room: 'Room 303', icon: 'calculator' },
    { name: 'Physic I', time: '11:30 AM - 01:00 PM', teacher: 'Dr. Marie Curie', room: 'Lab A', icon: 'beaker' },
    { name: 'History of Art', time: '02:00 PM - 03:30 PM', teacher: 'Prof. Vincent Van Gogh', room: 'Art Studio 2', icon: 'paint-brush' },
  ]);
  private studentDashboardEvents = signal([
    { name: 'Career Fair', date: 'October 25', location: 'Main Auditorium', icon: 'briefcase' },
    { name: 'Guest Lecture: AI Ethics', date: 'October 28', location: 'Hall of Science', icon: 'academic-cap' },
    { name: 'Hackathon Kick-off', date: 'November 02', location: 'CS Building', icon: 'chip' },
  ]);
  private gradeData = signal([75, 80, 78, 85, 88, 92]);

  getUpcomingClasses() { return this.upcomingClasses.asReadonly(); }
  getStudentDashboardEvents() { return this.studentDashboardEvents.asReadonly(); }
  getGradeData() { return this.gradeData.asReadonly(); }
}
