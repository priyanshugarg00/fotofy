export interface Booking {
  id: number;
  customerId: number;
  photographerId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  location: string | null;
  notes: string | null;
  totalAmount: number;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string | null;
  };
  photographer: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
}