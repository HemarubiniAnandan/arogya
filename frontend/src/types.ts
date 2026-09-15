export type UserRole = 'patient' | 'asha' | 'doctor' | 'staff' | 'admin';

export type LanguageCode = 'en' | 'mr' | 'hi';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  district: string;
  facilityId?: string;
  facilityName?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  aadhaarMasked: string; // e.g. XXXX-XXXX-4821
  abhaId: string; // e.g. 91-8273-9821-4491
  guardianName?: string;
  guardianContact?: string;
  address: string;
  state: string;
  district: string;
  village: string;
  pincode: string;
  chronicConditions: string[];
  allergies: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  consent: {
    allowAshaAssistance: boolean;
    allowRecordSharing: boolean;
    allowReferralSharing: boolean;
    allowTeleconsultSharing: boolean;
  };
  registeredViaAshaId?: string;
  isHighRisk?: boolean;
  highRiskCategory?: 'Maternal' | 'Chronic' | 'Pediatric' | 'Elderly';
}

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'PATIENT_ARRIVED'
  | 'ARRIVED'
  | 'PATIENT_CHECKED_IN'
  | 'IN_CONSULTATION'
  | 'CONSULTATION_COMPLETED'
  | 'FOLLOW_UP_SCHEDULED'
  | 'COMPLETED'
  | 'RESCHEDULED'
  | 'REJECTED_BY_HOSPITAL'
  | 'DOCTOR_UNAVAILABLE'
  | 'PATIENT_DID_NOT_ARRIVE'
  | 'CANCELLED';

export interface StatusTransitionLog {
  stage: AppointmentStatus;
  timestamp: string;
  updatedBy: string;
  role: UserRole;
  hospitalName: string;
  notes?: string;
}

export interface PrescriptionMedicine {
  id?: string;
  medicineName: string;
  dosage: string;
  frequency: string; // e.g. 1-0-1
  duration?: string;  // e.g. 5 days
  durationDays?: number;
  instructions: string; // e.g. After food
}

export interface MedicineItem extends PrescriptionMedicine {}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  doctorId?: string;
  doctorRegistrationNo?: string;
  hospitalName: string;
  date: string;
  openNotes: string; // visible to patient
  closedNotes?: string; // private clinical note, hidden from patient & ASHA
  confidentialDoctorNotes?: string;
  medicines: PrescriptionMedicine[];
  suggestedFollowUpDays?: number;
}

export interface Appointment {
  id: string; // e.g. APT-2026-8812
  tokenNumber: string; // e.g. MH-TK-042
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  hospitalId: string;
  hospitalName: string;
  hospitalType: 'PHC' | 'Rural Hospital' | 'District Hospital';
  department: string;
  doctorId: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  chiefComplaint: string;
  suggestedDepartmentByNLP?: string;
  isEmergencyAlert?: boolean;
  isEConsultation?: boolean;
  assistedByAshaId?: string;
  assistedByAshaName?: string;
  status: AppointmentStatus;
  statusHistory: StatusTransitionLog[];
  rejectionReason?: string;
  alternateSlotOffered?: string;
  roomAssigned?: string;
  queuePosition?: number;
  estimatedWaitMins?: number;
  cancellationReason?: string;
  prescription?: Prescription;
  qrCodeData: string;
  createdAt: string;
}

export interface HospitalFacility {
  id: string;
  name: string;
  type: 'PHC' | 'Rural Hospital' | 'District Hospital';
  district: string;
  taluka: string;
  address: string;
  distanceKm: number;
  emergencyStatus: 'Accepting' | 'Temporarily Unavailable';
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  icuBedsAvailable: number;
  oxygenBedsAvailable: number;
  departments: string[];
  diagnostics: {
    bloodTest: 'Available' | 'Limited' | 'Unavailable';
    xRay: 'Available' | 'Limited' | 'Unavailable';
    ultrasound: 'Available' | 'Limited' | 'Unavailable';
    mri: 'Available' | 'Limited' | 'Unavailable';
  };
  contactPhone: string;
}

export interface Doctor {
  id: string;
  name: string;
  regNumber: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  experienceYears: number;
  availableDays: string[];
  slots: string[];
  status: 'Available' | 'On Leave' | 'Emergency Duty' | 'Busy';
}

export interface VaccinationBooking {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  isChild: boolean;
  guardianName?: string;
  vaccineName: string;
  doseNumber: number;
  centreName: string;
  date: string;
  timeSlot: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED';
  ashaWorkerId?: string;
  smsSent: boolean;
  notes?: string;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientPhone?: string;
  fromHospital: string;
  sourceHospitalId?: string;
  sourceHospitalName?: string;
  toHospital: string;
  targetHospitalId?: string;
  targetHospitalName?: string;
  referredByDoctor: string;
  referringDoctorName?: string;
  department: string;
  specialtyRequired?: string;
  reason: string;
  clinicalSummary?: string;
  priority: 'EMERGENCY' | 'HIGH' | 'ROUTINE';
  urgency?: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'HIGH';
  status: 'CREATED' | 'SENT' | 'ACCEPTED' | 'PATIENT_TRAVELLED' | 'PATIENT_REACHED' | 'CONSULTED' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  createdDate?: string;
  updatedAt: string;
  rejectionReason?: string;
  qrCodeData: string;
  isEscalated?: boolean;
}

export interface HighRiskAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  village: string;
  category: 'Maternal' | 'Chronic' | 'Pediatric' | 'FollowUpDue';
  condition: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  assignedAshaId: string;
  notes: string;
  status: 'PENDING' | 'ATTENDED';
}

export interface MaternalRecord {
  patientId: string;
  patientName: string;
  age: number;
  edd: string; // Expected Date of Delivery
  trimester: 1 | 2 | 3;
  highRiskFlags: string[];
  scheduledCheckups: {
    checkupNo: number;
    dueDate: string;
    completedDate?: string;
    bp?: string;
    hemoglobin?: string;
    weightKg?: number;
    status: 'COMPLETED' | 'PENDING' | 'OVERDUE';
  }[];
}

export interface DiagnosticTestItem {
  id: string;
  testName: string;
  category: 'Pathology' | 'Radiology' | 'Cardiology';
  availableAt: {
    hospitalName: string;
    status: 'Available' | 'Limited Slots' | 'Not Available';
    cost: string;
    turnaroundHours: number;
    distanceKm: number;
  }[];
}

export interface MedicineItem {
  id: string;
  brandName: string;
  genericName: string;
  category: string;
  dosageForm: string;
  availableFacilities: {
    facilityName: string;
    facilityType: string;
    distanceKm: number;
    stock: number;
    phone: string;
    lastUpdated: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  details: string;
}

export interface SMSMessage {
  id: string;
  timestamp: string;
  recipientPhone: string;
  recipientName: string;
  role: UserRole;
  message: string;
  category: 'OTP' | 'Appointment' | 'Vaccination' | 'Referral' | 'Emergency' | 'Prescription' | 'Follow-up';
  status: 'Delivered' | 'Simulated';
}

export interface VoiceMessage {
  id: string;
  timestamp: string;
  recipientPhone: string;
  recipientName: string;
  language: LanguageCode;
  text: string;
  status: 'Delivered' | 'Queued';
}

export interface DoctorSlotRoster {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  timeSlot: string;
  maxCapacity: number;
  bookedCount: number;
  status: 'AVAILABLE' | 'FROZEN' | 'FULL';
  frozenByPatientId?: string;
  frozenAtTimestamp?: string;
  releasedNotificationSent?: boolean;
}

export interface SlotFreezeRecord {
  slotKey: string; // doctorId_date_timeSlot
  frozenByPatientId: string;
  patientName: string;
  patientPhone: string;
  timestamp: string; // ISO string
  expiryTimestamp: string;
  status: 'FROZEN' | 'RELEASED' | 'CONFIRMED';
  waitingQueue?: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    requestTimestamp: string;
  }[];
}
