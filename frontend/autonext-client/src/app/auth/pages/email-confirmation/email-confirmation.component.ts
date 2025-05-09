import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthCardComponent } from '../../components/auth-card/auth-card.component';
import { LoaderComponent } from '@shared/loader/loader.component';
import { ConfirmationAnimationComponent } from "../../../shared/confirmation-animation/confirmation-animation.component";
import { ErrorAnimationComponent } from "../../../shared/error-animation/error-animation.component";
import { AuthManager } from '@auth/services/authmanager.service';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [AuthCardComponent, LoaderComponent, ConfirmationAnimationComponent, ErrorAnimationComponent],
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css'],
})
export class EmailConfirmationComponent implements OnInit, OnDestroy {
  private tokenEmail: string = '';
  public isConfirmation: boolean;
  public isLoading: boolean = false;
  private route = inject(ActivatedRoute);
  private closeTimeout: any;
  private loadTimeout: any;
  private authManager = inject(AuthManager);

  constructor() {
    this.isConfirmation = false;
  }

  ngOnInit(): void {
    this.tokenEmail = this.route.snapshot.paramMap.get('token') || '';

    this.isLoading = true;

    this.loadTimeout = setTimeout(() => {
      this.authManager.confirmEmail(this.tokenEmail).subscribe({
        next: (message: string) => {
          this.isConfirmation = !!message;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error al confirmar email:', error);
          this.isConfirmation = false;
          this.isLoading = false;
        },
      });
    }, 500);

    this.closeTimeout = setTimeout(() => {
      window.close();
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }
  }
}