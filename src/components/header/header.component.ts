import { Component, ChangeDetectionStrategy, output, input, signal, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  name: string;
  role: string;
}

interface Notification {
  icon: string;
  title: string;
  time: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class HeaderComponent {
  private elementRef = inject(ElementRef);
  toggleSidebar = output<void>();
  user = input.required<User>();
  profileItemClick = output<string>();
  
  isNotificationsOpen = signal(false);
  isProfileOpen = signal(false);

  notifications = signal<Notification[]>([
    { icon: 'invoice', title: 'New invoice received', time: '5 min ago' },
    { icon: 'user', title: 'New user registered', time: '1 hour ago' },
    { icon: 'server', title: 'Server rebooted', time: '2 hours ago' },
  ]);

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.isNotificationsOpen.update(v => !v);
    this.isProfileOpen.set(false);
  }

  toggleProfile(event: MouseEvent) {
    event.stopPropagation();
    this.isProfileOpen.update(v => !v);
    this.isNotificationsOpen.set(false);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isNotificationsOpen.set(false);
      this.isProfileOpen.set(false);
    }
  }

  onProfileItemClick(item: string, event: MouseEvent) {
    event.preventDefault();
    this.profileItemClick.emit(item);
    this.isProfileOpen.set(false);
  }
}
