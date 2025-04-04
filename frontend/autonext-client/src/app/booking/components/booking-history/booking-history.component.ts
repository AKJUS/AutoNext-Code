import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SortableThComponent } from '../sortable-th/sortable-th.component';
import { PaginationComponent } from '../../../shared/components/ui/pagination/pagination.component';
import { toSignal } from '@angular/core/rxjs-interop';

import { BookingService } from '@booking/services/booking.service';
import { AuthService } from '@auth/services/auth.service';
import { AppComponent } from '../../../app.component';

@Component({
  selector: 'booking-history',
  standalone: true,
  imports: [
    CommonModule,
    SortableThComponent,
    PaginationComponent,
  ],
  providers: [DatePipe],
  templateUrl: './booking-history.component.html',
  styleUrl: './booking-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingHistoryComponent {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private appComponent: AppComponent = inject(AppComponent);
  private datePipe: DatePipe = inject(DatePipe);

  // Signals para paginación y filtros
  currentPage = signal(1);
  sortColumn = signal<string>('date');
  sortDirection = signal<'asc' | 'desc'>('asc');
  workCenterId = signal<number | null>(null);
  carId = signal<number | null>(null);
  date = signal<string | null>(null);

  userName = this.authService.getName();

  bookings$ = this.bookingService.bookingList$;
  total$ = this.bookingService.total$;

  cars = signal<{ id: number; name: string }[]>([]);
  workCenters = signal<{ id: number; name: string }[]>([]);

  total = toSignal(this.bookingService.total$, { initialValue: 0 });
  totalPages = computed(() => Math.ceil(this.total() / 6));

  constructor() {
    this.loadBookings();
    this.loadUserCars();
    this.loadWorkCenters();
  }

  onSort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.loadBookings();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadBookings();
  }

  onDelegationChange(value: string) {
    this.workCenterId.set(value ? +value : null);
    this.currentPage.set(1);
    this.loadBookings();
  }

  onCarChange(value: string) {
    this.carId.set(value ? +value : null);
    this.currentPage.set(1);
    this.loadBookings();
  }

  onDateChange(value: string) {
    this.date.set(value || null);
    this.currentPage.set(1);
    this.loadBookings();
  }


  private loadBookings() {
    this.bookingService
      .getBookingsByUser({
        page: this.currentPage() - 1,
        sortBy: this.sortColumn(),
        ascending: this.sortDirection() === 'asc',
        date: this.date() ?? undefined,
        workCenterId: this.workCenterId() ?? undefined,
        carId: this.carId() ?? undefined,
      })
      .subscribe();
  }

  private loadUserCars() {
    this.bookingService.getUserCars().subscribe({
      next: (cars) => this.cars.set(cars),
      error: (err) => console.error('Error al cargar coches:', err),
    });
  }

  private loadWorkCenters() {
    this.bookingService.getWorkCenters().subscribe({
      next: (centers) => this.workCenters.set(centers),
      error: (err) => console.error('Error al cargar delegaciones:', err),
    });
  }

  confirmBooking(id: number) {
    this.bookingService.updateConfirmationStatus(id, 'Confirmed').subscribe({
      next: () => this.loadBookings(),
      error: (err) => console.error('Error al confirmar reserva:', err),
    });
  }

  cancelBooking(id: number) {
    console.log('[CANCEL ID]', id);
    this.bookingService.cancelBooking(id).subscribe({
      next: () => {
        this.loadBookings();
        this.appComponent.showToast('success', 'Reserva cancelada', '', 3000, 80);
      },
      error: (err) => {
        console.error('Error al cancelar reserva:', err),
          this.appComponent.showToast('error', 'Error al cancelar reserva', err.message, 3000, 80);
      }
    });
  }

  getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  getStatusLabel(status: string | null): string {
    switch (status) {
      case 'Active':
        return 'Activa';
      case 'Pending':
        return 'Reservada';
      case 'Cancelled':
        return 'Cancelada';
      case 'Strike':
        return 'Strike';
      case 'Completed':
        return 'Finalizada';
      case 'Blocked':
        return 'Bloqueada';
      default:
        return 'Desconocido';
    }
  }

  formatDateToISO(value: string): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;

    return date.toISOString().split('T')[0];
  }


  formatHour(hour: string): string | null {
    const date = new Date('1970-01-01T' + hour + 'Z');
    return this.datePipe.transform(date, 'HH:mm');
  }
}
