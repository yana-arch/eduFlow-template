import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService, User, UserRole, UserStatus } from '../../services/data.service';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule],
})
export class UserManagementComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private dataService = inject(DataService);

  // State
  users = this.dataService.getUsers();
  searchTerm = signal('');
  isModalOpen = signal(false);
  editingUser = signal<User | null>(null);
  
  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['Student' as UserRole, Validators.required],
    status: ['Active' as UserStatus, Validators.required],
  });

  // Derived State
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.users();
    }
    return this.users().filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  });
  
  totalUsers = computed(() => this.users().length);
  adminCount = computed(() => this.users().filter(u => u.role === 'Admin').length);
  teacherCount = computed(() => this.users().filter(u => u.role === 'Teacher').length);
  studentCount = computed(() => this.users().filter(u => u.role === 'Student').length);
  
  getRoleStyles(role: UserRole) {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Teacher': return 'bg-blue-100 text-blue-800';
      case 'Student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusStyles(status: UserStatus) {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Methods
  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openModal(user: User | null = null) {
    this.editingUser.set(user);
    if (user) {
      this.userForm.patchValue(user);
    } else {
      this.userForm.reset({
        name: '', email: '', role: 'Student', status: 'Active'
      });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();
    const userData = {
      name: formValue.name!,
      email: formValue.email!,
      role: formValue.role!,
      status: formValue.status!,
    };

    if (this.editingUser()) {
      this.dataService.updateUser({ ...this.editingUser()!, ...userData });
    } else {
      this.dataService.addUser(userData);
    }

    this.closeModal();
  }

  deleteUser(id: number, event: MouseEvent) {
    event.stopPropagation();
    if(confirm('Are you sure you want to delete this user?')) {
      this.dataService.deleteUser(id);
    }
  }
}
