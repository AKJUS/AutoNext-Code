export type Booking = {
  date: string;
  reservationTime: string;
  workcenter: string;
  parkingSpace: string;
  car: string;
  status: string;
  issues: string;
  canConfirm: boolean;
  canCancel: boolean;
  [key: string]: string | boolean;
};
