import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'pending';
  role: string;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  attendees: number;
  capacity: number;
}

export interface Donation {
  id: string;
  donor: string;
  amount: number;
  date: Date;
  category: string;
  method: 'cash' | 'check' | 'online' | 'other';
  verificationImage?: string | null;
  isVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: { id: string; name: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = 'http://localhost:3000';

  members = signal<Member[]>(this.loadFromStorage<Member[]>('members') || []);
  events = signal<Event[]>(this.loadFromStorage<Event[]>('events') || []);
  donations = signal<Donation[]>(this.loadFromStorage<Donation[]>('donations') || []);

  totalMembers = computed(() => this.members().length);
  activeMembersCount = computed(() => this.members().filter(m => m.status === 'active').length);
  eventsCount = computed(() => this.events().length);
  donationsThisMonth = computed(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return this.donations()
      .filter(d => d.date.getFullYear() === year && d.date.getMonth() === month)
      .reduce((s, d) => s + d.amount, 0);
  });

  constructor(private http: HttpClient) {
    this.loadMembers();
    this.loadEvents();
    this.loadDonations();
  }

  private mapEvent(e: any): Event {
    return {
      id: String(e.id),
      title: e.title,
      date: e.date ? new Date(e.date) : new Date(),
      time: e.time,
      location: e.location,
      description: e.description,
      attendees: e.attendees,
      capacity: e.capacity,
    };
  }

  private mapDonation(d: any): Donation {
    return {
      id: String(d.id),
      donor: d.donor,
      amount: d.amount,
      date: d.date ? new Date(d.date) : new Date(),
      category: d.category,
      method: d.method,
      verificationImage: d.verificationImage ?? null,
      isVerified: Boolean(d.isVerified),
    };
  }

  private mapMember(m: any): Member {
    return {
      id: String(m.id),
      name: m.name,
      email: m.email,
      phone: m.phone,
      age: m.age,
      status: m.status,
      role: m.role,
      joinDate: m.joinDate ? new Date(m.joinDate) : new Date(),
    };
  }

  async loadMembers(): Promise<void> {
    try {
      const result = await firstValueFrom(this.http.get<Member[]>(`${this.apiUrl}/members`));
      const mapped = result.map(m => this.mapMember(m));
      this.members.set(mapped);
      this.saveToStorage('members', mapped);
    } catch {
      const fallback = this.loadFromStorage<Member[]>('members');
      if (fallback && fallback.length > 0) {
        this.members.set(fallback.map(m => ({ ...m, joinDate: new Date(m.joinDate) })));
      } else if (this.members().length === 0) {
        this.seedMembers();
      }
    }
  }

  async addMember(member: Member): Promise<Member> {
    try {
      const payload = {
        name: member.name,
        email: member.email,
        phone: member.phone,
        age: member.age,
        status: member.status,
        role: member.role,
        joinDate: member.joinDate.toISOString(),
      };
      const created = await firstValueFrom(this.http.post<Member>(`${this.apiUrl}/members`, payload));
      const mapped = this.mapMember(created);
      this.members.update(list => [...list, mapped]);
      this.saveToStorage('members', this.members());
      return mapped;
    } catch {
      const local = { ...member, id: Date.now().toString() };
      this.members.update(list => [...list, local]);
      this.saveToStorage('members', this.members());
      return local;
    }
  }

  async addMembers(members: Member[]): Promise<Member[]> {
    try {
      const payload = members.map(member => ({
        name: member.name,
        email: member.email,
        phone: member.phone,
        age: member.age,
        status: member.status,
        role: member.role,
        joinDate: member.joinDate.toISOString(),
      }));
      const created = await firstValueFrom(this.http.post<Member[]>(`${this.apiUrl}/members/bulk`, payload));
      const mapped = created.map(m => this.mapMember(m));
      this.members.update(list => [...list, ...mapped]);
      this.saveToStorage('members', this.members());
      return mapped;
    } catch {
      const local = members.map(member => ({ ...member, id: Date.now().toString() + Math.random() }));
      this.members.update(list => [...list, ...local]);
      this.saveToStorage('members', this.members());
      return local;
    }
  }

  async updateMember(updated: Member): Promise<Member> {
    try {
      const payload = {
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        age: updated.age,
        status: updated.status,
        role: updated.role,
        joinDate: updated.joinDate.toISOString(),
      };
      const result = await firstValueFrom(this.http.patch<Member>(`${this.apiUrl}/members/${updated.id}`, payload));
      const mapped = this.mapMember(result);
      this.members.update(list => list.map(item => (item.id === mapped.id ? mapped : item)));
      this.saveToStorage('members', this.members());
      return mapped;
    } catch {
      this.members.update(list => list.map(item => (item.id === updated.id ? updated : item)));
      this.saveToStorage('members', this.members());
      return updated;
    }
  }

  async deleteMember(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/members/${id}`));
      this.members.update(list => list.filter(m => m.id !== id));
      this.saveToStorage('members', this.members());
    } catch {
      this.members.update(list => list.filter(m => m.id !== id));
      this.saveToStorage('members', this.members());
    }
  }

  getMemberById(id: string): Member | undefined {
    return this.members().find(m => m.id === id);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }),
    );

    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));
    }

    return response;
  }


  async loadEvents(): Promise<void> {
    try {
      const result = await firstValueFrom(this.http.get<Event[]>(`${this.apiUrl}/events`));
      const mapped = result.map(e => this.mapEvent(e));
      this.events.set(mapped);
      this.saveToStorage('events', mapped);
    } catch {
      const fallback = this.loadFromStorage<Event[]>('events');
      if (fallback && fallback.length > 0) {
        this.events.set(fallback.map(e => ({ ...e, date: new Date(e.date) })));
      } else if (this.events().length === 0) {
        this.seedEvents();
      }
    }
  }

  async addEvent(event: Event): Promise<Event> {
    try {
      const payload = {
        title: event.title,
        date: event.date.toISOString(),
        time: event.time,
        location: event.location,
        description: event.description,
        attendees: event.attendees,
        capacity: event.capacity,
      };
      const created = await firstValueFrom(this.http.post<Event>(`${this.apiUrl}/events`, payload));
      const mapped = this.mapEvent(created);
      this.events.update(list => [...list, mapped]);
      this.saveToStorage('events', this.events());
      return mapped;
    } catch {
      const local = { ...event, id: Date.now().toString() };
      this.events.update(list => [...list, local]);
      this.saveToStorage('events', this.events());
      return local;
    }
  }

  async updateEvent(updated: Event): Promise<Event> {
    try {
      const payload = {
        title: updated.title,
        date: updated.date.toISOString(),
        time: updated.time,
        location: updated.location,
        description: updated.description,
        attendees: updated.attendees,
        capacity: updated.capacity,
      };
      const result = await firstValueFrom(this.http.patch<Event>(`${this.apiUrl}/events/${updated.id}`, payload));
      const mapped = this.mapEvent(result);
      this.events.update(list => list.map(item => (item.id === mapped.id ? mapped : item)));
      this.saveToStorage('events', this.events());
      return mapped;
    } catch {
      this.events.update(list => list.map(item => (item.id === updated.id ? updated : item)));
      this.saveToStorage('events', this.events());
      return updated;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/events/${id}`));
      this.events.update(list => list.filter(e => e.id !== id));
      this.saveToStorage('events', this.events());
    } catch {
      this.events.update(list => list.filter(e => e.id !== id));
      this.saveToStorage('events', this.events());
    }
  }

  async loadDonations(): Promise<void> {
    try {
      const result = await firstValueFrom(this.http.get<Donation[]>(`${this.apiUrl}/donations`));
      const mapped = result.map(d => this.mapDonation(d));
      this.donations.set(mapped);
      this.saveToStorage('donations', mapped);
    } catch {
      const fallback = this.loadFromStorage<Donation[]>('donations');
      if (fallback && fallback.length > 0) {
        this.donations.set(fallback.map(d => ({ ...d, date: new Date(d.date) })));
      } else if (this.donations().length === 0) {
        this.seedDonations();
      }
    }
  }

  async addDonation(donation: Donation): Promise<Donation> {
    try {
      const payload = {
        donor: donation.donor,
        amount: donation.amount,
        date: donation.date.toISOString(),
        category: donation.category,
        method: donation.method,
        verificationImage: donation.verificationImage ?? null,
        isVerified: Boolean(donation.isVerified),
      };
      const created = await firstValueFrom(this.http.post<Donation>(`${this.apiUrl}/donations`, payload));
      const mapped = this.mapDonation(created);
      this.donations.update(list => [...list, mapped]);
      this.saveToStorage('donations', this.donations());
      return mapped;
    } catch {
      const local = { ...donation, id: Date.now().toString() };
      this.donations.update(list => [...list, local]);
      this.saveToStorage('donations', this.donations());
      return local;
    }
  }

  async updateDonation(updated: Donation): Promise<Donation> {
    try {
      const payload = {
        donor: updated.donor,
        amount: updated.amount,
        date: updated.date.toISOString(),
        category: updated.category,
        method: updated.method,
        verificationImage: updated.verificationImage ?? null,
        isVerified: Boolean(updated.isVerified),
      };
      const result = await firstValueFrom(this.http.patch<Donation>(`${this.apiUrl}/donations/${updated.id}`, payload));
      const mapped = this.mapDonation(result);
      this.donations.update(list => list.map(item => (item.id === mapped.id ? mapped : item)));
      this.saveToStorage('donations', this.donations());
      return mapped;
    } catch {
      this.donations.update(list => list.map(item => (item.id === updated.id ? updated : item)));
      this.saveToStorage('donations', this.donations());
      return updated;
    }
  }

  async deleteDonation(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/donations/${id}`));
      this.donations.update(list => list.filter(d => d.id !== id));
      this.saveToStorage('donations', this.donations());
    } catch {
      this.donations.update(list => list.filter(d => d.id !== id));
      this.saveToStorage('donations', this.donations());
    }
  }

  private loadFromStorage<T>(key: string): T | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data) as T;
      }
    } catch {
      // ignore
    }
    return null;
  }

  private saveToStorage(key: string, data: any) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  }

  private seedMembers() {
    const sample: Member[] = [
      { id: '1', name: 'Joshua', email: 'josh@example.com', phone: '555-0101', age: '21', joinDate: new Date(2020, 0, 15), status: 'active', role: 'Member' },
      { id: '2', name: 'Mani', email: 'mani@example.com', phone: '555-0102', age: '21', joinDate: new Date(2021, 6, 22), status: 'active', role: 'Elder' },
      { id: '3', name: 'Kriti', email: 'kriti@example.com', phone: '555-0103', age: '21', joinDate: new Date(2019, 3, 10), status: 'active', role: 'Deacon' },
      { id: '4', name: 'Uthaya', email: 'uthaya@example.com', phone: '555-0104', age: '34', joinDate: new Date(2023, 11, 5), status: 'pending', role: 'Member' },
      { id: '5', name: 'Madesh', email: 'maadu@example.com', phone: '555-0105', age: '48', joinDate: new Date(2018, 2, 28), status: 'inactive', role: 'Member' },
    ];
    this.members.set(sample);
    this.saveToStorage('members', sample);
  }

  private seedEvents() {
    const sample: Event[] = [
      {
        id: '1',
        title: 'Sunday Service',
        date: new Date(),
        time: '10:00 AM',
        location: 'Main Sanctuary',
        description: 'Weekly Sunday worship service',
        attendees: 156,
        capacity: 200,
      },
      {
        id: '2',
        title: 'Bible Study',
        date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
        time: '7:00 PM',
        location: 'Fellowship Hall',
        description: 'Weekly Bible discussion and prayer',
        attendees: 45,
        capacity: 60,
      },
    ];
    this.events.set(sample);
    this.saveToStorage('events', sample);
  }

  private seedDonations() {
    const sample: Donation[] = [
      { id: '1', donor: 'John Doe', amount: 250, date: new Date(), category: 'Tithes', method: 'online', verificationImage: null, isVerified: false },
      { id: '2', donor: 'Jane Smith', amount: 500, date: new Date(new Date().getTime() - 86400000), category: 'Building Fund', method: 'check', verificationImage: null, isVerified: false },
    ];
    this.donations.set(sample);
    this.saveToStorage('donations', sample);
  }
}
