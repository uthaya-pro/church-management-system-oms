import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private data: DataService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['admin@church.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.disableFormControls();

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.data.login(email, password)
      .then(response => {
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set('Invalid email or password');
        }
      })
      .catch(() => {
        this.errorMessage.set('Invalid email or password');
      })
      .finally(() => {
        this.isLoading.set(false);
        this.enableFormControls();
      });
  }

  private disableFormControls(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.disable();
    });
  }

  private enableFormControls(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.enable();
    });
  }

          togglePasswordVisibility(): void {
            this.showPassword.update(value => !value);
          }
        }
