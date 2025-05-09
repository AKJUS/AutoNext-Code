import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Component, HostListener, inject } from '@angular/core';

import { InputComponent } from '@shared/components/ui/input/input.component';
import { CustomButtonComponent } from '@shared/components/ui/custom-button/custom-button.component';

import { AuthService } from '@auth/services/auth.service';
import { AuthValidationService } from '@auth/services/auth-validation.service';
import { AuthManager } from '@auth/services/authmanager.service';

import { Observable } from 'rxjs';
import { AuthCardComponent } from '@auth/components/auth-card/auth-card.component';

import { AppComponent } from '../../../app.component';


@Component({
  selector: 'auth-login',
  imports: [
    InputComponent,
    CustomButtonComponent,
    CommonModule,
    FormsModule,
    AuthCardComponent,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService: AuthService = inject(AuthService);
  private authManager = inject(AuthManager);
  private router: Router = inject(Router);
  private authValidation = inject(AuthValidationService);
  private appComponent: AppComponent = inject(AppComponent);

  email: string = '';
  password: string = '';

  loginResponse$: Observable<string | null> | null = null;

  constructor() {}
  
  login() {
    const validationError = this.authValidation.validateLoginFields(this.email, this.password);
    if (validationError) {
      this.appComponent.showToast('warn', 'Campos inválidos', validationError, 3000);
      return;
    }
  
    this.authManager.login(this.email, this.password).subscribe({
      next: () => {
        const role = this.authService.getRole();
        const redirectUrl = role === 'Admin' ? '/admin-home' : '/home';
        this.router.navigate([redirectUrl]);
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.appComponent.showToast('error', 'Error de autenticación', err.message, 3000);
      },
    });
  }
  

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    this.login();
  }
}
