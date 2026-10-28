import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './login.service';
import { errorMessage } from '@/core/services/notification.service';
import { IconComponent } from '@/shared/components/icon/icon.component';

@Component({ selector: 'app-login', standalone: true, imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './login.component.html', styleUrl: './login.component.scss' })
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(LoginService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly visible = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]], password: ['', Validators.required],
  });
  async submit() {
    if (this.form.invalid || this.loading()) { this.form.markAllAsTouched(); return; }
    this.error.set(''); this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email.trim(), password);
      await this.router.navigate(['/inicio']);
    } catch (error) { this.error.set(errorMessage(error, 'login')); }
    finally { this.loading.set(false); }
  }
}
