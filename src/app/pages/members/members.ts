import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DataService, Member } from '../../services/data.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './members.html',
  styleUrl: './members.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersComponent implements OnInit {
  // proxy to shared data service signals
  get members() {
    return this.data.members;
  }

  get totalMembers() {
    return this.data.totalMembers();
  }

  get activeMembers() {
    return this.data.activeMembersCount();
  }

  isLoading = signal(true);
  searchQuery = signal('');
  filterStatus = signal<'all' | 'active' | 'inactive' | 'pending'>('all');
  expandedMemberId = signal<string | null>(null);
  // stats are computed in the data service if needed

  // form state
  showForm = signal(false);
  newMember: Partial<Member> = {
    name: '',
    email: '',
    phone: '',
    role: '',
    age:'',
    status: 'active',
    joinDate: undefined,
  };

  constructor(private router: Router, private data: DataService) {}

  ngOnInit(): void {
    // data service already holds list (seeded or from storage);
    this.isLoading.set(false);
  }

  getMembers() {
    const filtered = this.members().filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesFilter = this.filterStatus() === 'all' || m.status === this.filterStatus();
      return matchesSearch && matchesFilter;
    });
    return filtered;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  trackById(index: number, member: Member) {
    return member.id;
  }

  toggleMemberDetails(memberId: string): void {
    this.expandedMemberId.update(current => (current === memberId ? null : memberId));
  }

  isExpanded(memberId: string): boolean {
    return this.expandedMemberId() === memberId;
  }

  /** form helpers */
  private updateStats(): void {
    // stats are computed in DataService; no-op
  }

  async submitForm(form?: NgForm): Promise<void> {
    // template form validation
    if (form && form.invalid) {
      return;
    }

    if (!this.newMember.name || !this.newMember.email || !this.newMember.phone || !this.newMember.role || !this.newMember.age) {
      return;
    }

    const member: Member = {
      id: Date.now().toString(),
      name: this.newMember.name,
      email: this.newMember.email,
      phone: this.newMember.phone,
      role: this.newMember.role,
      age: this.newMember.age,
      status: (this.newMember.status as Member['status']) || 'active',
      joinDate: this.newMember.joinDate ? new Date(this.newMember.joinDate) : new Date(),
    };

    await this.data.addMember(member);

    if (form) {
      form.resetForm();
    }
    this.resetForm();
    this.showForm.set(false);
  }

  cancelForm(form?: NgForm): void {
    if (form) {
      form.resetForm();
    }
    this.resetForm();
    this.showForm.set(false);
  }

  private resetForm(): void {
    this.newMember = {
      name: '',
      email: '',
      phone: '',
      role: '',
      age:'',
      status: 'active',
      joinDate: undefined,
    };
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    try {
      const text = await file.text();
      const members = this.parseCSV(text);
      if (members.length === 0) {
        alert('No valid members found in CSV');
        return;
      }

      await this.data.addMembers(members);
      alert(`Successfully added ${members.length} members`);
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert('Error processing CSV file');
    }

    // Reset the input
    input.value = '';
  }

  private parseCSV(csvText: string): Member[] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return []; // Need header + at least one row

    const headers = lines[0].split(',').map(h => h.trim());
    const normalizedHeaders = headers.map(h => this.normalizeHeader(h));

    const requiredFields: ('name' | 'email' | 'phone' | 'age')[] = ['name', 'email', 'phone', 'age'];
    const missingHeaders = requiredFields.filter(field => this.getColumnIndex(normalizedHeaders, field) === -1);
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const members: Member[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < normalizedHeaders.length) continue;

      const name = this.getValue(values, normalizedHeaders, 'name');
      const email = this.getValue(values, normalizedHeaders, 'email');
      const phone = this.getValue(values, normalizedHeaders, 'phone');
      const age = this.getValue(values, normalizedHeaders, 'age');
      const role = this.getValue(values, normalizedHeaders, 'role') || 'Member';
      const status = this.parseStatus(this.getValue(values, normalizedHeaders, 'status'));
      const joinDateValue = this.getValue(values, normalizedHeaders, 'joinDate');

      const member: Member = {
        id: '', // Will be set by backend or service
        name,
        email,
        phone,
        age,
        role,
        status,
        joinDate: joinDateValue ? new Date(joinDateValue) : new Date(),
      };

      // Basic validation
      if (member.name && member.email && member.phone && member.age && member.role) {
        members.push(member);
      }
    }

    return members;
  }

  private normalizeHeader(header: string): string {
    return header.toLowerCase().replace(/[^a-z]/g, '');
  }

  private getColumnIndex(headers: string[], field: 'name' | 'email' | 'phone' | 'age' | 'role' | 'status' | 'joinDate'): number {
    const aliases: Record<'name' | 'email' | 'phone' | 'age' | 'role' | 'status' | 'joinDate', string[]> = {
      name: ['name', 'fullname'],
      email: ['email', 'emailaddress', 'mail'],
      phone: ['phone', 'phonenumber', 'mobile', 'mobilenumber', 'contactnumber'],
      age: ['age'],
      role: ['role', 'designation'],
      status: ['status', 'activemember'],
      joinDate: ['joindate', 'joiningdate', 'datejoined'],
    };

    return headers.findIndex(h => aliases[field].includes(h));
  }

  private getValue(values: string[], headers: string[], field: 'name' | 'email' | 'phone' | 'age' | 'role' | 'status' | 'joinDate'): string {
    const index = this.getColumnIndex(headers, field);
    return index >= 0 ? (values[index] || '').trim() : '';
  }

  private parseStatus(value: string): Member['status'] {
    const normalized = value.toLowerCase();
    if (normalized === 'inactive' || normalized === 'no' || normalized === 'false') {
      return 'inactive';
    }
    if (normalized === 'pending') {
      return 'pending';
    }
    return 'active';
  }
}
