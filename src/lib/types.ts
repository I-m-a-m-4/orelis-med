
import type { LucideIcon } from "lucide-react";

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId?: string;
  patientId?: string;
  status: 'pending' | 'active';
  country?: string;
}

export interface Patient {
  id: string; // This will be the Firestore document ID
  clinicId: string;
  surname: string;
  firstName: string;
  sex: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  address: string;
  dob: string; // ISO string
  origin: string;
  tribe: string;
  occupation: string;
  phone: string;
  email?: string;
  country?: string;
  notes?: string;
  nextOfKin: {
    name: string;
    relation: string;
    address: string;
    phone: string;
  };
  registrationDate: string; // ISO string
  lastVisit?: string; // ISO string
  status?: 'Active' | 'Inactive';
  [key: string]: any; // Allow custom fields
}


export interface Staff extends UserProfile {}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string; // ISO string
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
}

export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    roles: UserRole[];
}

export interface Clinic {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  country?: string;
  staffCount?: number;
  specialties?: string[];
  subscription?: {
    plan: 'price_annual' | 'trial' | 'infinite';
    status: 'active' | 'trialing' | 'expired';
    customerId?: string;
    expiryDate?: string | null; // ISO string
  };
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  authorId: string;
  authorName: string;
  clinicId?: string;
  publishedAt: string | null;
  updatedAt: string;
  status: 'draft' | 'published';
  metaDescription?: string;
}

export interface Notification {
    id: string;
    userId: string;
    clinicId?: string;
    title: string;
    message: string;
    type: 'subscription' | 'announcement' | 'info' | 'welcome' | 'warning';
    read: boolean;
    timestamp: string; // ISO string
    link?: string;
}
