import { Component, ChangeDetectionStrategy, input, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService, User, UserRole } from '../../services/data.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class MyProfileComponent {
  private dataService = inject(DataService);
  // FIX: Explicitly typed `fb` as `FormBuilder` to resolve a type inference issue.
  private fb: FormBuilder = inject(FormBuilder);

  // FIX: Changed from a required input to an input with a default value of 1 (Admin user).
  // The parent components do not provide the required `userId`, which would cause a runtime error.
  userId = input<number>(1);

  private allUsers = this.dataService.getUsers();
  user = computed(() => this.allUsers().find(u => u.id === this.userId()));

  isEditing = signal(false);
  
  profileForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.profileForm.patchValue({
          name: currentUser.name,
          email: currentUser.email,
        });
      }
    });
  }

  toggleEdit(editMode: boolean) {
    if (!editMode && this.profileForm.dirty) {
      // If cancelling, reset the form to original values
      const currentUser = this.user();
      if (currentUser) {
        this.profileForm.reset({
          name: currentUser.name,
          email: currentUser.email,
        });
      }
    }
    this.isEditing.set(editMode);
  }

  saveProfile() {
    if (this.profileForm.invalid || !this.user()) {
      return;
    }

    const updatedUserData: User = {
      ...this.user()!,
      name: this.profileForm.value.name!,
      email: this.profileForm.value.email!,
    };

    this.dataService.updateUser(updatedUserData);
    this.isEditing.set(false);
  }

  getRoleStyles(role: UserRole) {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Teacher': return 'bg-blue-100 text-blue-800';
      case 'Student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
