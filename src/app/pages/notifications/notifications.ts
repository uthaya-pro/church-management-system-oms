import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  notifications = signal<NotificationItem[]>([
    {
      id: 'n1',
      title: 'New Donation Received',
      message: 'A new donation was recorded for the Building Fund.',
      date: 'Today, 9:20 AM',
      read: false,
    },
    {
      id: 'n2',
      title: 'Event Reminder',
      message: 'Youth Fellowship starts tomorrow at 6:00 PM.',
      date: 'Yesterday, 5:10 PM',
      read: false,
    },
    {
      id: 'n3',
      title: 'Member Registered',
      message: 'A new member profile was added to the directory.',
      date: 'Mar 28, 2026',
      read: true,
    },
  ]);

  constructor(private router: Router) {}

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  markRead(id: string): void {
    this.notifications.update(list => list.map(n => (n.id === id ? { ...n, read: true } : n)));
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
