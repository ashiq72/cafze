export type User = {
  id: string;
  _id?: string;
  email: string;
  name?: string;
  role?: "organizer" | "admin" | "super_admin" | "user";
  image?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  about?: string;
  location?: string;
  website?: string;
  emailVerified?: boolean;
};

export type TicketType = {
  id: string;
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  sold?: number;
};

export type EventStatus = "draft" | "published" | "completed" | "cancelled";

export type Event = {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  startsAt: string;
  date?: string;
  location: string;
  bannerUrl?: string;
  status?: EventStatus;
  ticketTypes: TicketType[];
  ticketsSold?: number;
  organizer?: User;
};

export type EventInput = {
  title: string;
  description: string;
  startsAt: string;
  location: string;
  status?: EventStatus;
  ticketTypes: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
};

export type Attendee = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  ticketType?: TicketType | string;
  ticketId?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
};

export type Ticket = {
  id: string;
  _id?: string;
  eventId: string;
  attendeeId?: string;
  ticketType: TicketType | string;
  qrCode?: string;
  qrCodeUrl?: string;
  status?: "valid" | "used" | "cancelled";
};

export type BookingResult = {
  attendee: Attendee;
  ticket: Ticket;
};

export type CheckinResult = {
  status: "valid" | "already-used" | "invalid";
  message: string;
  attendee?: Attendee;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};
