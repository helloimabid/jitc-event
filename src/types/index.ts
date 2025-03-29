
export type EventCategory = 'workshop' | 'competition' | 'fest';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox';
  required: boolean;
  options?: string[]; // For select fields
}

export interface FestSegment {
  id: string;
  name: string;
  description: string;
  rules?: string;
  fee?: number; // Optional fee
  capacity?: number; // Optional capacity limit
  formFields: FormField[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  location: string;
  image?: string;
  rules?: string;
  fee?: number; // Optional fee
  capacity?: number; // Optional capacity limit
  formFields: FormField[];
  segments?: FestSegment[]; // Only for fest category
}

export interface Registration {
  id: string;
  eventId: string;
  segmentId?: string; // Only applicable for fest registrations
  userData: Record<string, any>;
  timestamp: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  paymentMethod?: 'bkash';
  transactionId?: string;
}
