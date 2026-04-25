import { Component, ChangeDetectionStrategy, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService, Donation as DonationModel } from '../../services/data.service';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donations.html',
  styleUrl: './donations.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationsComponent implements OnInit {
  // donations signal reference (set in ngOnInit)
  donations: any;
  isLoading = signal(false);
  selectedDonation = signal<any | null>(null);

  // form signals
  donor = signal('');
  amount = signal<string | number | null>(null);
  category = signal('Tithes');
  method = signal<'cash' | 'check' | 'online' | 'other'>('cash');
  date = signal<string>(new Date().toISOString().slice(0, 10));
  verificationImage = signal<string | null>(null);
  selectedFileName = signal('');

  totalAmount = computed(() => this.donations().reduce((s: number, d: any) => s + (d.amount || 0), 0));
  monthlyAverage = computed(() => {
    const list = this.donations();
    if (list.length === 0) return 0;
    return Math.round(this.totalAmount() / list.length);
  });

  constructor(private router: Router, private dataService: DataService) {}

  ngOnInit(): void {
    // bind to service signals after DI
    this.donations = this.dataService.donations;
    // no initial load needed; DataService seeds data if empty
    this.isLoading.set(false);
  }

  addDonation(): void {
    const amt = Number(this.amount());
    if (!this.donor().trim() || !amt || isNaN(amt)) return;
    const newDonation: DonationModel = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      donor: this.donor().trim(),
      amount: amt,
      date: new Date(this.date()),
      category: this.category(),
      method: this.method(),
      verificationImage: this.verificationImage(),
      isVerified: Boolean(this.verificationImage()),
    };
    this.dataService.addDonation(newDonation);
    // reset form
    this.donor.set('');
    this.amount.set(null);
    this.date.set(new Date().toISOString().slice(0, 10));
    this.verificationImage.set(null);
    this.selectedFileName.set('');
  }

  async onVerificationImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      input.value = '';
      return;
    }

    const imageDataUrl = await this.readFileAsDataURL(file);
    this.verificationImage.set(imageDataUrl);
    this.selectedFileName.set(file.name);
  }

  removeVerificationImage(fileInput: HTMLInputElement): void {
    this.verificationImage.set(null);
    this.selectedFileName.set('');
    fileInput.value = '';
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read the image file.'));
      reader.readAsDataURL(file);
    });
  }

  viewDetails(donation: any): void {
    this.selectedDonation.set(donation);
  }

  closeDetail(): void {
    this.selectedDonation.set(null);
  }

  deleteDonation(donationId: string): void {
    this.dataService.deleteDonation(donationId);
    this.closeDetail();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
