import {
  Patient,
  Appointment,
  HospitalFacility,
  Doctor,
  VaccinationBooking,
  Referral,
  HighRiskAlert,
  MaternalRecord,
  AuditLog,
  SMSMessage,
  VoiceMessage,
  UserRole,
  AppointmentStatus,
  Prescription
} from '../types';
import { twilioService, voiceService } from './mockAdapters';

const STORAGE_KEY_PREFIX = 'maha_aarogya_v1_';

// Initial Mock Seed Data
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PAT-MH-1001',
    fullName: 'Ramesh Jadhav',
    phone: '9822014589',
    dob: '1976-04-12',
    age: 50,
    gender: 'Male',
    aadhaarMasked: 'XXXX-XXXX-4821',
    abhaId: '91-4412-8819-2041',
    address: 'Near Maruti Temple, Ward No. 2',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Morgaon',
    pincode: '412304',
    chronicConditions: ['Type 2 Diabetes', 'Mild Hypertension'],
    allergies: ['Penicillin'],
    currentMedications: ['Metformin 500mg (1-0-1)', 'Amlodipine 5mg (0-0-1)'],
    emergencyContact: {
      name: 'Sunita Jadhav',
      phone: '9822014590',
      relation: 'Spouse'
    },
    consent: {
      allowAshaAssistance: true,
      allowRecordSharing: true,
      allowReferralSharing: true,
      allowTeleconsultSharing: true
    },
    isHighRisk: true,
    highRiskCategory: 'Chronic'
  },
  {
    id: 'PAT-MH-1002',
    fullName: 'Meena Patil',
    phone: '9765412309',
    dob: '1998-09-20',
    age: 28,
    gender: 'Female',
    aadhaarMasked: 'XXXX-XXXX-9344',
    abhaId: '91-8891-2245-1109',
    guardianName: 'Sanjay Patil',
    guardianContact: '9765412310',
    address: 'Gavthan Vasti, Near ZP School',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Morgaon',
    pincode: '412304',
    chronicConditions: ['Gestational Anemia (Hb 9.2 g/dL)'],
    allergies: [],
    currentMedications: ['IFA Tablets', 'Calcium 500mg'],
    emergencyContact: {
      name: 'Sanjay Patil',
      phone: '9765412310',
      relation: 'Husband'
    },
    consent: {
      allowAshaAssistance: true,
      allowRecordSharing: true,
      allowReferralSharing: true,
      allowTeleconsultSharing: true
    },
    isHighRisk: true,
    highRiskCategory: 'Maternal'
  },
  {
    id: 'PAT-MH-1003',
    fullName: 'Aarav Pawar',
    phone: '9421087654',
    dob: '2024-06-15',
    age: 2,
    gender: 'Male',
    aadhaarMasked: 'XXXX-XXXX-1102',
    abhaId: '91-5512-3344-9981',
    guardianName: 'Sunita Pawar',
    guardianContact: '9421087654',
    address: 'Pawar Mala, Plot 14',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Morgaon',
    pincode: '412304',
    chronicConditions: [],
    allergies: [],
    currentMedications: [],
    emergencyContact: {
      name: 'Sunita Pawar',
      phone: '9421087654',
      relation: 'Mother'
    },
    consent: {
      allowAshaAssistance: true,
      allowRecordSharing: true,
      allowReferralSharing: true,
      allowTeleconsultSharing: true
    },
    isHighRisk: false,
    highRiskCategory: 'Pediatric'
  },
  {
    id: 'PAT-MH-10023',
    fullName: 'Ravi Kumar',
    phone: '9850123456',
    dob: '1992-02-14',
    age: 34,
    gender: 'Male',
    aadhaarMasked: 'XXXX-XXXX-7721',
    abhaId: '91-1002-3849-1122',
    address: 'Datta Mandir Lane',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Morgaon',
    pincode: '412304',
    chronicConditions: ['Asthma'],
    allergies: ['Dust'],
    currentMedications: ['Salbutamol Inhaler PRN'],
    emergencyContact: { name: 'Pooja Kumar', phone: '9850123457', relation: 'Wife' },
    consent: { allowAshaAssistance: true, allowRecordSharing: true, allowReferralSharing: true, allowTeleconsultSharing: true }
  },
  {
    id: 'PAT-MH-10087',
    fullName: 'Ravi Shankar',
    phone: '9850987654',
    dob: '1984-07-25',
    age: 42,
    gender: 'Male',
    aadhaarMasked: 'XXXX-XXXX-8832',
    abhaId: '91-1008-7231-9988',
    address: 'Post Office Road',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Saswad',
    pincode: '412301',
    chronicConditions: [],
    allergies: [],
    currentMedications: [],
    emergencyContact: { name: 'Geeta Shankar', phone: '9850987655', relation: 'Sister' },
    consent: { allowAshaAssistance: false, allowRecordSharing: true, allowReferralSharing: true, allowTeleconsultSharing: false }
  },
  {
    id: 'PAT-MH-10112',
    fullName: 'Ravindran Jadhav',
    phone: '9850554433',
    dob: '1975-11-03',
    age: 51,
    gender: 'Male',
    aadhaarMasked: 'XXXX-XXXX-3341',
    abhaId: '91-1011-2948-4411',
    address: 'Subhash Chowk, Baramati Road',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Morgaon',
    pincode: '412304',
    chronicConditions: ['Joint Pain'],
    allergies: [],
    currentMedications: ['Pain Balm'],
    emergencyContact: { name: 'Sagar Jadhav', phone: '9850554434', relation: 'Son' },
    consent: { allowAshaAssistance: true, allowRecordSharing: true, allowReferralSharing: true, allowTeleconsultSharing: true }
  }
];

const INITIAL_HOSPITALS: HospitalFacility[] = [
  {
    id: 'HOSP-PHC-MOR',
    name: 'Primary Health Centre (PHC) Morgaon',
    type: 'PHC',
    district: 'Pune',
    taluka: 'Baramati',
    address: 'Main Road, Near Morgaon Bus Stand, Tal. Baramati',
    distanceKm: 3.5,
    emergencyStatus: 'Accepting',
    totalBeds: 12,
    availableBeds: 5,
    occupiedBeds: 7,
    icuBedsAvailable: 0,
    oxygenBedsAvailable: 3,
    departments: ['General Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Dentistry'],
    diagnostics: {
      bloodTest: 'Available',
      xRay: 'Available',
      ultrasound: 'Limited',
      mri: 'Unavailable'
    },
    contactPhone: '02112-255100'
  },
  {
    id: 'HOSP-RH-BAR',
    name: 'Rural Hospital (RH) Baramati',
    type: 'Rural Hospital',
    district: 'Pune',
    taluka: 'Baramati',
    address: 'Medical College Campus, Kasba, Baramati',
    distanceKm: 18.2,
    emergencyStatus: 'Accepting',
    totalBeds: 60,
    availableBeds: 16,
    occupiedBeds: 44,
    icuBedsAvailable: 4,
    oxygenBedsAvailable: 14,
    departments: ['General Medicine', 'Cardiology', 'Obstetrics & Gynecology', 'Pediatrics', 'Orthopedics', 'Ophthalmology', 'Dermatology'],
    diagnostics: {
      bloodTest: 'Available',
      xRay: 'Available',
      ultrasound: 'Available',
      mri: 'Limited'
    },
    contactPhone: '02112-222340'
  },
  {
    id: 'HOSP-DH-AUNDH',
    name: 'District Hospital Aundh, Pune',
    type: 'District Hospital',
    district: 'Pune',
    taluka: 'Haveli',
    address: 'Aundh Chest Hospital Complex, Pune',
    distanceKm: 48.0,
    emergencyStatus: 'Accepting',
    totalBeds: 350,
    availableBeds: 42,
    occupiedBeds: 308,
    icuBedsAvailable: 12,
    oxygenBedsAvailable: 48,
    departments: ['General Medicine', 'Cardiology', 'Pulmonology / Respiratory', 'Obstetrics & Gynecology', 'Pediatrics', 'Orthopedics', 'Ophthalmology', 'Dermatology', 'Dentistry'],
    diagnostics: {
      bloodTest: 'Available',
      xRay: 'Available',
      ultrasound: 'Available',
      mri: 'Available'
    },
    contactPhone: '020-27276501'
  },
  {
    id: 'HOSP-SDH-SAS',
    name: 'Sub-District Hospital (SDH) Saswad',
    type: 'Rural Hospital',
    district: 'Pune',
    taluka: 'Purandar',
    address: 'Saswad-Pune Highway Road, Saswad',
    distanceKm: 14.5,
    emergencyStatus: 'Accepting',
    totalBeds: 50,
    availableBeds: 11,
    occupiedBeds: 39,
    icuBedsAvailable: 2,
    oxygenBedsAvailable: 8,
    departments: ['General Medicine', 'Obstetrics & Gynecology', 'Pediatrics', 'Orthopedics'],
    diagnostics: {
      bloodTest: 'Available',
      xRay: 'Available',
      ultrasound: 'Limited',
      mri: 'Unavailable'
    },
    contactPhone: '02115-222105'
  }
];

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'DOC-MH-01',
    name: 'Dr. Aniruddha Kulkarni',
    regNumber: 'MMC-2012-08492',
    specialty: 'General Medicine',
    hospitalId: 'HOSP-PHC-MOR',
    hospitalName: 'Primary Health Centre (PHC) Morgaon',
    experienceYears: 12,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM'],
    status: 'Available'
  },
  {
    id: 'DOC-MH-02',
    name: 'Dr. Snehal Deshmukh',
    regNumber: 'MMC-2015-11940',
    specialty: 'Obstetrics & Gynecology',
    hospitalId: 'HOSP-RH-BAR',
    hospitalName: 'Rural Hospital (RH) Baramati',
    experienceYears: 9,
    availableDays: ['Mon', 'Wed', 'Fri'],
    slots: ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '03:30 PM'],
    status: 'Available'
  },
  {
    id: 'DOC-MH-03',
    name: 'Dr. Rajeshwar Thorat',
    regNumber: 'MMC-2008-04291',
    specialty: 'Cardiology',
    hospitalId: 'HOSP-DH-AUNDH',
    hospitalName: 'District Hospital Aundh, Pune',
    experienceYears: 18,
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    slots: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM'],
    status: 'Available'
  },
  {
    id: 'DOC-MH-04',
    name: 'Dr. Priya Bansode',
    regNumber: 'MMC-2018-09121',
    specialty: 'Pediatrics',
    hospitalId: 'HOSP-SDH-SAS',
    hospitalName: 'Sub-District Hospital (SDH) Saswad',
    experienceYears: 7,
    availableDays: ['Tue', 'Thu', 'Sat'],
    slots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM'],
    status: 'Available'
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-2026-8812',
    tokenNumber: 'MH-TK-042',
    patientId: 'PAT-MH-1001',
    patientName: 'Ramesh Jadhav',
    patientAge: 50,
    patientGender: 'Male',
    patientPhone: '9822014589',
    hospitalId: 'HOSP-PHC-MOR',
    hospitalName: 'Primary Health Centre (PHC) Morgaon',
    hospitalType: 'PHC',
    department: 'General Medicine',
    doctorId: 'DOC-MH-01',
    doctorName: 'Dr. Aniruddha Kulkarni',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    chiefComplaint: 'Chest discomfort and breathlessness after walking since yesterday.',
    suggestedDepartmentByNLP: 'Cardiology / General Medicine',
    isEmergencyAlert: false,
    isEConsultation: false,
    assistedByAshaId: 'ASHA-MH-PN-042',
    assistedByAshaName: 'Surekha Tai Shinde',
    status: 'REQUESTED',
    statusHistory: [
      {
        stage: 'REQUESTED',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedBy: 'Ramesh Jadhav (Assisted by ASHA)',
        role: 'patient',
        hospitalName: 'Primary Health Centre (PHC) Morgaon',
        notes: 'Requested slot 10:00 AM with Dr. Kulkarni'
      }
    ],
    qrCodeData: 'MAHARASHTRA:HEALTH:APT:APT-2026-8812:TOKEN:MH-TK-042:PAT:PAT-MH-1001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'APT-2026-8809',
    tokenNumber: 'MH-TK-038',
    patientId: 'PAT-MH-1002',
    patientName: 'Meena Patil',
    patientAge: 28,
    patientGender: 'Female',
    patientPhone: '9765412309',
    hospitalId: 'HOSP-RH-BAR',
    hospitalName: 'Rural Hospital (RH) Baramati',
    hospitalType: 'Rural Hospital',
    department: 'Obstetrics & Gynecology',
    doctorId: 'DOC-MH-02',
    doctorName: 'Dr. Snehal Deshmukh',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:30 AM',
    chiefComplaint: 'Second trimester routine ANC checkup and iron supplementation review.',
    suggestedDepartmentByNLP: 'Obstetrics & Gynecology',
    status: 'CONFIRMED',
    statusHistory: [
      {
        stage: 'REQUESTED',
        timestamp: '08:30 AM',
        updatedBy: 'Surekha Tai Shinde (ASHA)',
        role: 'asha',
        hospitalName: 'Rural Hospital (RH) Baramati',
        notes: 'Routine ANC visit requested'
      },
      {
        stage: 'CONFIRMED',
        timestamp: '09:00 AM',
        updatedBy: 'Kavita More (Staff)',
        role: 'staff',
        hospitalName: 'Rural Hospital (RH) Baramati',
        notes: 'Slot confirmed for Dr. Deshmukh. Token issued.'
      }
    ],
    qrCodeData: 'MAHARASHTRA:HEALTH:APT:APT-2026-8809:TOKEN:MH-TK-038:PAT:PAT-MH-1002',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'APT-2026-8790',
    tokenNumber: 'MH-TK-021',
    patientId: 'PAT-MH-10023',
    patientName: 'Ravi Kumar',
    patientAge: 34,
    patientGender: 'Male',
    patientPhone: '9850123456',
    hospitalId: 'HOSP-PHC-MOR',
    hospitalName: 'Primary Health Centre (PHC) Morgaon',
    hospitalType: 'PHC',
    department: 'General Medicine',
    doctorId: 'DOC-MH-01',
    doctorName: 'Dr. Aniruddha Kulkarni',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM',
    chiefComplaint: 'Mild wheezing and dust allergy post harvest work.',
    suggestedDepartmentByNLP: 'General Medicine',
    status: 'COMPLETED',
    statusHistory: [
      { stage: 'REQUESTED', timestamp: 'Yesterday', updatedBy: 'Ravi Kumar', role: 'patient', hospitalName: 'PHC Morgaon' },
      { stage: 'CONFIRMED', timestamp: 'Yesterday', updatedBy: 'Staff', role: 'staff', hospitalName: 'PHC Morgaon' },
      { stage: 'PATIENT_ARRIVED', timestamp: '08:45 AM', updatedBy: 'Front Desk', role: 'staff', hospitalName: 'PHC Morgaon' },
      { stage: 'PATIENT_CHECKED_IN', timestamp: '08:50 AM', updatedBy: 'OPD Nurse', role: 'staff', hospitalName: 'PHC Morgaon' },
      { stage: 'IN_CONSULTATION', timestamp: '09:05 AM', updatedBy: 'Dr. Kulkarni', role: 'doctor', hospitalName: 'PHC Morgaon' },
      { stage: 'CONSULTATION_COMPLETED', timestamp: '09:20 AM', updatedBy: 'Dr. Kulkarni', role: 'doctor', hospitalName: 'PHC Morgaon' },
      { stage: 'COMPLETED', timestamp: '09:25 AM', updatedBy: 'Dr. Kulkarni', role: 'doctor', hospitalName: 'PHC Morgaon' }
    ],
    prescription: {
      id: 'RX-2026-0941',
      appointmentId: 'APT-2026-8790',
      patientId: 'PAT-MH-10023',
      patientName: 'Ravi Kumar',
      doctorName: 'Dr. Aniruddha Kulkarni',
      doctorRegistrationNo: 'MMC-2012-08492',
      hospitalName: 'Primary Health Centre (PHC) Morgaon',
      date: new Date().toISOString().split('T')[0],
      openNotes: 'Mild bronchospasm observed. Avoid dust exposure and use warm saline steam.',
      closedNotes: 'Lungs clear bilaterally post-bronchodilator. Re-evaluate if PEFR drops below 80%.',
      medicines: [
        { id: '1', medicineName: 'Levocetirizine 5mg', dosage: '5 mg', frequency: '0-0-1', duration: '5 days', instructions: 'At bedtime' },
        { id: '2', medicineName: 'Salbutamol Inhaler 100mcg', dosage: '2 puffs', frequency: 'PRN', duration: 'As needed', instructions: 'Inhale with spacer if shortness of breath' }
      ],
      suggestedFollowUpDays: 14
    },
    qrCodeData: 'MAHARASHTRA:HEALTH:APT:APT-2026-8790:TOKEN:MH-TK-021:PAT:PAT-MH-10023',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const INITIAL_VACCINATIONS: VaccinationBooking[] = [
  {
    id: 'VAC-2026-01',
    tokenNumber: 'V-04',
    patientId: 'PAT-MH-1003',
    patientName: 'Aarav Pawar',
    isChild: true,
    guardianName: 'Sunita Pawar',
    vaccineName: 'MR (Measles & Rubella) Dose 2',
    doseNumber: 2,
    centreName: 'Primary Health Centre (PHC) Morgaon',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    timeSlot: '10:00 AM - 11:00 AM',
    status: 'SCHEDULED',
    ashaWorkerId: 'ASHA-MH-PN-042',
    smsSent: true,
    notes: 'Child 24 months due for booster dose.'
  },
  {
    id: 'VAC-2026-02',
    tokenNumber: 'V-11',
    patientId: 'PAT-MH-1002',
    patientName: 'Meena Patil',
    isChild: false,
    vaccineName: 'Tetanus & adult Diphtheria (Td) - Dose 2',
    doseNumber: 2,
    centreName: 'Sub-Centre Morgaon Ward 2',
    date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    timeSlot: '09:30 AM - 10:30 AM',
    status: 'SCHEDULED',
    ashaWorkerId: 'ASHA-MH-PN-042',
    smsSent: true
  }
];

const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'REF-2026-0042',
    patientId: 'PAT-MH-1001',
    patientName: 'Ramesh Jadhav',
    fromHospital: 'Primary Health Centre (PHC) Morgaon',
    toHospital: 'District Hospital Aundh, Pune',
    referredByDoctor: 'Dr. Aniruddha Kulkarni',
    department: 'Cardiology',
    reason: 'Exertional angina with history of T2D and ECG showing mild ST depression. Needs 2D-Echocardiogram and specialist evaluation.',
    priority: 'HIGH',
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    qrCodeData: 'REF:REF-2026-0042:FROM:PHC-MOR:TO:DH-AUNDH:PAT:PAT-MH-1001',
    isEscalated: false
  },
  {
    id: 'REF-2026-0038',
    patientId: 'PAT-MH-1002',
    patientName: 'Meena Patil',
    fromHospital: 'Primary Health Centre (PHC) Morgaon',
    toHospital: 'Rural Hospital (RH) Baramati',
    referredByDoctor: 'Dr. Aniruddha Kulkarni',
    department: 'Obstetrics & Gynecology',
    reason: 'Gestational Anemia Hb 8.9 g/dL. Recommended parenteral iron sucrose infusion and fetal growth ultrasound.',
    priority: 'HIGH',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    qrCodeData: 'REF:REF-2026-0038:FROM:PHC-MOR:TO:RH-BAR:PAT:PAT-MH-1002',
    isEscalated: false
  }
];

const INITIAL_HIGH_RISK_ALERTS: HighRiskAlert[] = [
  {
    id: 'HRA-01',
    patientId: 'PAT-MH-1002',
    patientName: 'Meena Patil',
    patientPhone: '9765412309',
    village: 'Morgaon',
    category: 'Maternal',
    condition: 'Moderate Gestational Anemia (Hb 9.2 g/dL)',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    assignedAshaId: 'ASHA-MH-PN-042',
    notes: 'Confirm IFA intake, verify diet, assist with Baramati ANC visit.',
    status: 'PENDING'
  },
  {
    id: 'HRA-02',
    patientId: 'PAT-MH-1001',
    patientName: 'Ramesh Jadhav',
    patientPhone: '9822014589',
    village: 'Morgaon',
    category: 'Chronic',
    condition: 'T2D + Hypertension + Exertional Chest Discomfort',
    priority: 'HIGH',
    dueDate: new Date().toISOString().split('T')[0],
    assignedAshaId: 'ASHA-MH-PN-042',
    notes: 'Coordinate referral transport to District Hospital Aundh.',
    status: 'PENDING'
  },
  {
    id: 'HRA-03',
    patientId: 'PAT-MH-1003',
    patientName: 'Aarav Pawar',
    patientPhone: '9421087654',
    village: 'Morgaon',
    category: 'Pediatric',
    condition: 'MR Dose 2 Vaccination Due',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    assignedAshaId: 'ASHA-MH-PN-042',
    notes: 'Mobilize mother Sunita Pawar for Thursday session site.',
    status: 'PENDING'
  }
];

const INITIAL_MATERNAL: MaternalRecord[] = [
  {
    patientId: 'PAT-MH-1002',
    patientName: 'Meena Patil',
    age: 28,
    edd: '2026-11-15',
    trimester: 2,
    highRiskFlags: ['Moderate Anemia', 'Past Low Birth Weight Risk'],
    scheduledCheckups: [
      { checkupNo: 1, dueDate: '2026-04-10', completedDate: '2026-04-12', bp: '118/76', hemoglobin: '10.1', weightKg: 52, status: 'COMPLETED' },
      { checkupNo: 2, dueDate: '2026-06-15', completedDate: '2026-06-16', bp: '120/80', hemoglobin: '9.2', weightKg: 55, status: 'COMPLETED' },
      { checkupNo: 3, dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], bp: 'Pending', status: 'PENDING' },
      { checkupNo: 4, dueDate: '2026-10-10', status: 'PENDING' }
    ]
  }
];

const INITIAL_SMS_LOGS: SMSMessage[] = [
  {
    id: 'SMS-101',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    recipientPhone: '9822014589',
    recipientName: 'Ramesh Jadhav',
    role: 'patient',
    category: 'Appointment',
    message: 'AarogyaRakshak: Your appointment request APT-2026-8812 for PHC Morgaon is SUBMITTED. Token: MH-TK-042. Awaiting hospital confirmation.',
    status: 'Delivered'
  },
  {
    id: 'SMS-102',
    timestamp: '09:00 AM',
    recipientPhone: '9765412309',
    recipientName: 'Meena Patil',
    role: 'patient',
    category: 'Appointment',
    message: 'AarogyaRakshak: Appointment CONFIRMED for Dr. Snehal Deshmukh at RH Baramati on today at 11:30 AM. Token: MH-TK-038. Show QR at reception.',
    status: 'Delivered'
  },
  {
    id: 'SMS-103',
    timestamp: 'Yesterday',
    recipientPhone: '9421087654',
    recipientName: 'Sunita Pawar',
    role: 'patient',
    category: 'Vaccination',
    message: 'U-WIN Reminder: Aarav Pawar is due for MR Dose 2 vaccination on Thursday at PHC Morgaon session. ASHA Surekha Tai is your coordinator.',
    status: 'Delivered'
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-901',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actorName: 'Surekha Tai Shinde',
    actorRole: 'asha',
    action: 'ASSISTED_BOOKING',
    resource: 'APT-2026-8812',
    details: 'ASHA worker assisted patient Ramesh Jadhav in booking OPD appointment.'
  },
  {
    id: 'AUD-902',
    timestamp: '09:00 AM',
    actorName: 'Kavita More',
    actorRole: 'staff',
    action: 'CONFIRM_APPOINTMENT',
    resource: 'APT-2026-8809',
    details: 'Hospital staff confirmed appointment and assigned Token MH-TK-038.'
  },
  {
    id: 'AUD-903',
    timestamp: '08:55 AM',
    actorName: 'Dr. Aniruddha Kulkarni',
    actorRole: 'doctor',
    action: 'VIEW_MEDICAL_RECORD',
    resource: 'PAT-MH-10023',
    details: 'Doctor accessed longitudinal timeline and previous prescriptions with consent.'
  }
];

type StorageSubscriber = () => void;

class StorageService {
  private patients: Patient[] = [];
  private appointments: Appointment[] = [];
  private hospitals: HospitalFacility[] = [];
  private doctors: Doctor[] = [];
  private vaccinations: VaccinationBooking[] = [];
  private referrals: Referral[] = [];
  private highRiskAlerts: HighRiskAlert[] = [];
  private maternalRecords: MaternalRecord[] = [];
  private smsLogs: SMSMessage[] = [];
  private voiceLogs: VoiceMessage[] = [];
  private auditLogs: AuditLog[] = [];
  private isOffline: boolean = false;
  private pendingOfflineQueue: any[] = [];
  private subscribers: Set<StorageSubscriber> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedPatients = localStorage.getItem(STORAGE_KEY_PREFIX + 'patients');
      this.patients = storedPatients ? JSON.parse(storedPatients) : INITIAL_PATIENTS;

      const storedAppointments = localStorage.getItem(STORAGE_KEY_PREFIX + 'appointments');
      this.appointments = storedAppointments ? JSON.parse(storedAppointments) : INITIAL_APPOINTMENTS;

      const storedHospitals = localStorage.getItem(STORAGE_KEY_PREFIX + 'hospitals');
      this.hospitals = storedHospitals ? JSON.parse(storedHospitals) : INITIAL_HOSPITALS;

      const storedDoctors = localStorage.getItem(STORAGE_KEY_PREFIX + 'doctors');
      this.doctors = storedDoctors ? JSON.parse(storedDoctors) : INITIAL_DOCTORS;

      const storedVaccinations = localStorage.getItem(STORAGE_KEY_PREFIX + 'vaccinations');
      this.vaccinations = storedVaccinations ? JSON.parse(storedVaccinations) : INITIAL_VACCINATIONS;

      const storedReferrals = localStorage.getItem(STORAGE_KEY_PREFIX + 'referrals');
      this.referrals = storedReferrals ? JSON.parse(storedReferrals) : INITIAL_REFERRALS;

      const storedAlerts = localStorage.getItem(STORAGE_KEY_PREFIX + 'alerts');
      this.highRiskAlerts = storedAlerts ? JSON.parse(storedAlerts) : INITIAL_HIGH_RISK_ALERTS;

      const storedMaternal = localStorage.getItem(STORAGE_KEY_PREFIX + 'maternal');
      this.maternalRecords = storedMaternal ? JSON.parse(storedMaternal) : INITIAL_MATERNAL;

      const storedSms = localStorage.getItem(STORAGE_KEY_PREFIX + 'sms');
      this.smsLogs = storedSms ? JSON.parse(storedSms) : INITIAL_SMS_LOGS;

      const storedAudit = localStorage.getItem(STORAGE_KEY_PREFIX + 'audit');
      this.auditLogs = storedAudit ? JSON.parse(storedAudit) : INITIAL_AUDIT_LOGS;
    } catch (e) {
      console.warn('LocalStorage access restricted, falling back to in-memory state', e);
      this.patients = INITIAL_PATIENTS;
      this.appointments = INITIAL_APPOINTMENTS;
      this.hospitals = INITIAL_HOSPITALS;
      this.doctors = INITIAL_DOCTORS;
      this.vaccinations = INITIAL_VACCINATIONS;
      this.referrals = INITIAL_REFERRALS;
      this.highRiskAlerts = INITIAL_HIGH_RISK_ALERTS;
      this.maternalRecords = INITIAL_MATERNAL;
      this.smsLogs = INITIAL_SMS_LOGS;
      this.auditLogs = INITIAL_AUDIT_LOGS;
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'patients', JSON.stringify(this.patients));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'appointments', JSON.stringify(this.appointments));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'hospitals', JSON.stringify(this.hospitals));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'doctors', JSON.stringify(this.doctors));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'vaccinations', JSON.stringify(this.vaccinations));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'referrals', JSON.stringify(this.referrals));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'alerts', JSON.stringify(this.highRiskAlerts));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'maternal', JSON.stringify(this.maternalRecords));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'sms', JSON.stringify(this.smsLogs));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'audit', JSON.stringify(this.auditLogs));
    } catch (e) {
      // Ignored
    }
    this.notifySubscribers();
  }

  public subscribe(cb: StorageSubscriber): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('Subscriber notify error', e);
      }
    });
  }

  // --- Offline Mode Controller ---
  public toggleOfflineMode(force?: boolean): boolean {
    this.isOffline = force !== undefined ? force : !this.isOffline;
    if (!this.isOffline && this.pendingOfflineQueue.length > 0) {
      // Sync queued requests
      this.addAuditLog('System Sync', 'admin', 'SYNC_OFFLINE_QUEUE', 'Batch', `Synchronized ${this.pendingOfflineQueue.length} offline actions to Maharashtra Health Grid.`);
      this.pendingOfflineQueue = [];
    }
    this.notifySubscribers();
    return this.isOffline;
  }

  public getIsOffline(): boolean {
    return this.isOffline;
  }

  public getPendingQueueCount(): number {
    return this.pendingOfflineQueue.length;
  }

  // --- Audit Log ---
  public addAuditLog(actorName: string, actorRole: UserRole, action: string, resource: string, details: string) {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actorName,
      actorRole,
      action,
      resource,
      details
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    this.persist();
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // --- SMS & Voice Dispatcher ---
  public dispatchSMS(recipientPhone: string, recipientName: string, role: UserRole, message: string, category: any) {
    const sms: SMSMessage = {
      id: `SMS-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipientPhone,
      recipientName,
      role,
      message,
      category,
      status: 'Delivered'
    };
    this.smsLogs.unshift(sms);
    if (this.smsLogs.length > 50) this.smsLogs.pop();
    twilioService.sendSMS(recipientPhone, message, category);
    this.persist();
  }

  public dispatchVoiceCall(recipientPhone: string, recipientName: string, text: string, language: any = 'mr') {
    const voiceMsg: VoiceMessage = {
      id: `VOICE-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipientPhone,
      recipientName,
      language,
      text,
      status: 'Delivered'
    };
    this.voiceLogs.unshift(voiceMsg);
    voiceService.triggerVoiceCall(recipientPhone, text, language);
    this.persist();
  }

  public getSMSLogs(): SMSMessage[] {
    return this.smsLogs;
  }

  public getVoiceLogs(): VoiceMessage[] {
    return this.voiceLogs;
  }

  // --- Patients ---
  public getPatients(): Patient[] {
    return this.patients;
  }

  public getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  public searchPatients(query: string): Patient[] {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    return this.patients.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.abhaId.includes(q) ||
      p.village.toLowerCase().includes(q)
    );
  }

  public addPatient(patient: Patient, creatorName: string = 'Self', creatorRole: UserRole = 'patient'): Patient {
    this.patients.unshift(patient);
    this.addAuditLog(creatorName, creatorRole, 'REGISTER_PATIENT', patient.id, `Created longitudinal health record for ${patient.fullName} (ABHA: ${patient.abhaId})`);
    this.dispatchSMS(patient.phone, patient.fullName, 'patient', `Namaste ${patient.fullName}, your MahaAarogya Health ID ${patient.id} and ABHA ID ${patient.abhaId} have been registered.`, 'OTP');
    this.persist();
    return patient;
  }

  public updatePatientConsent(patientId: string, consentUpdate: Partial<Patient['consent']>) {
    const p = this.patients.find(pt => pt.id === patientId);
    if (p) {
      p.consent = { ...p.consent, ...consentUpdate };
      this.addAuditLog(p.fullName, 'patient', 'UPDATE_CONSENT', p.id, `Updated privacy consent: ASHA assistance set to ${p.consent.allowAshaAssistance}`);
      this.persist();
    }
  }

  // --- Appointments ---
  public getAppointments(): Appointment[] {
    return this.appointments;
  }

  public getAppointmentById(id: string): Appointment | undefined {
    return this.appointments.find(a => a.id === id);
  }

  public createAppointment(data: Omit<Appointment, 'id' | 'tokenNumber' | 'status' | 'statusHistory' | 'qrCodeData' | 'createdAt'>): Appointment {
    const id = `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const tokenNumber = `MH-TK-${Math.floor(10 + Math.random() * 89)}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newAppointment: Appointment = {
      ...data,
      id,
      tokenNumber,
      status: 'REQUESTED',
      statusHistory: [
        {
          stage: 'REQUESTED',
          timestamp: nowStr,
          updatedBy: data.assistedByAshaName ? `${data.assistedByAshaName} (ASHA)` : data.patientName,
          role: data.assistedByAshaName ? 'asha' : 'patient',
          hospitalName: data.hospitalName,
          notes: `Requested booking for ${data.date} (${data.timeSlot}) in ${data.department}`
        }
      ],
      qrCodeData: `MAHARASHTRA:HEALTH:APT:${id}:TOKEN:${tokenNumber}:PAT:${data.patientId}:HOSP:${data.hospitalId}`,
      createdAt: new Date().toISOString()
    };

    if (this.isOffline) {
      this.pendingOfflineQueue.push({ type: 'CREATE_APPOINTMENT', appointment: newAppointment });
    }

    this.appointments.unshift(newAppointment);

    const actor = data.assistedByAshaName || data.patientName;
    const actorRole: UserRole = data.assistedByAshaName ? 'asha' : 'patient';
    this.addAuditLog(actor, actorRole, 'BOOK_APPOINTMENT', id, `Appointment requested at ${data.hospitalName} with ${data.doctorName}. Token: ${tokenNumber}`);

    // Dispatch SMS to patient
    this.dispatchSMS(
      data.patientPhone,
      data.patientName,
      'patient',
      `MahaAarogya: Appointment requested for ${data.patientName} at ${data.hospitalName}. Token: ${tokenNumber}. Awaiting hospital confirmation.`,
      'Appointment'
    );

    // If ASHA assisted, log ASHA alert
    if (data.assistedByAshaId) {
      this.addAuditLog(data.assistedByAshaName || 'ASHA', 'asha', 'ASHA_ASSISTED_BOOKING', id, `Recorded ASHA assistance token for ${data.patientName}`);
    }

    this.persist();
    return newAppointment;
  }

  public updateAppointmentStatus(
    appointmentId: string,
    newStatus: AppointmentStatus,
    updatedByOrOptions?: any,
    roleOrUpdatedBy?: any,
    notesOrRole?: any,
    rejectionReason?: string,
    alternateSlotOffered?: string
  ): Appointment | null {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) return null;

    let updatedBy = 'Staff Receptionist';
    let role: UserRole = 'staff';
    let notes: string | undefined;
    let rejReason = rejectionReason;
    let altSlot = alternateSlotOffered;

    if (typeof updatedByOrOptions === 'object' && updatedByOrOptions !== null) {
      if (updatedByOrOptions.roomAssigned) apt.roomAssigned = updatedByOrOptions.roomAssigned;
      if (updatedByOrOptions.queuePosition !== undefined) apt.queuePosition = updatedByOrOptions.queuePosition;
      if (updatedByOrOptions.estimatedWaitMins !== undefined) apt.estimatedWaitMins = updatedByOrOptions.estimatedWaitMins;
      if (updatedByOrOptions.cancellationReason) {
        apt.cancellationReason = updatedByOrOptions.cancellationReason;
        rejReason = updatedByOrOptions.cancellationReason;
      }
      if (updatedByOrOptions.date) apt.date = updatedByOrOptions.date;
      if (updatedByOrOptions.timeSlot) apt.timeSlot = updatedByOrOptions.timeSlot;
      if (updatedByOrOptions.doctorId) {
        apt.doctorId = updatedByOrOptions.doctorId;
        const targetDoc = this.doctors.find(d => d.id === updatedByOrOptions.doctorId);
        if (targetDoc) {
          apt.doctorName = targetDoc.name;
          apt.hospitalId = targetDoc.hospitalId;
          apt.hospitalName = targetDoc.hospitalName;
          apt.department = targetDoc.specialty;
        }
      }
      if (updatedByOrOptions.doctorName && !updatedByOrOptions.doctorId) {
        apt.doctorName = updatedByOrOptions.doctorName;
      }
      if (updatedByOrOptions.department) apt.department = updatedByOrOptions.department;
      if (updatedByOrOptions.notes) notes = updatedByOrOptions.notes;

      updatedBy = roleOrUpdatedBy || 'Hospital Staff';
      role = (notesOrRole as UserRole) || 'staff';
    } else {
      updatedBy = updatedByOrOptions || 'Hospital Staff';
      role = (roleOrUpdatedBy as UserRole) || 'staff';
      notes = notesOrRole;
    }

    apt.status = newStatus;
    if (rejReason) apt.rejectionReason = rejReason;
    if (altSlot) apt.alternateSlotOffered = altSlot;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    apt.statusHistory.push({
      stage: newStatus,
      timestamp: timeStr,
      updatedBy,
      role,
      hospitalName: apt.hospitalName,
      notes: notes || `Status updated to ${newStatus}`
    });

    this.addAuditLog(
      updatedBy,
      role,
      role === 'patient' && newStatus === 'CANCELLED'
        ? 'PATIENT_CANCELLED_APPOINTMENT'
        : role === 'patient' && newStatus === 'RESCHEDULED'
        ? 'PATIENT_RESCHEDULED_APPOINTMENT'
        : `STATUS_${newStatus}`,
      appointmentId,
      notes || `Appointment moved to ${newStatus}`
    );

    // Trigger SMS and notifications based on status
    if (newStatus === 'CONFIRMED') {
      this.dispatchSMS(
        apt.patientPhone,
        apt.patientName,
        'patient',
        `MahaAarogya: Your appointment at ${apt.hospitalName} is CONFIRMED for ${apt.date} at ${apt.timeSlot}. Token: ${apt.tokenNumber}. Room: ${apt.roomAssigned || 'General OPD'}. Show QR at reception.`,
        'Appointment'
      );
    } else if (newStatus === 'RESCHEDULED') {
      if (role === 'patient') {
        // 1. Patient confirmation SMS
        this.dispatchSMS(
          apt.patientPhone,
          apt.patientName,
          'patient',
          `MahaAarogya UPDATE: Your appointment at ${apt.hospitalName} has been RESCHEDULED to ${apt.date} at ${apt.timeSlot} with ${apt.doctorName}. Token: ${apt.tokenNumber}. Reason: "${apt.cancellationReason || 'Patient plan change'}".`,
          'Appointment'
        );
        // 2. Doctor Alert SMS
        this.dispatchSMS(
          '9822019900',
          apt.doctorName,
          'doctor',
          `MahaAarogya OPD ALERT: Patient ${apt.patientName} (${apt.tokenNumber}) rescheduled appointment to ${apt.date} at ${apt.timeSlot}. Reason: "${apt.cancellationReason || 'Patient request'}". OPD schedule updated.`,
          'Appointment'
        );
        // 3. Hospital Staff Notification SMS
        this.dispatchSMS(
          '02112-255100',
          `${apt.hospitalName} Reception`,
          'staff',
          `HOSPITAL ALERT: Patient ${apt.patientName} (${apt.tokenNumber}) rescheduled to ${apt.date} at ${apt.timeSlot} with Dr. ${apt.doctorName}. Reception roster updated.`,
          'Appointment'
        );
      } else {
        this.dispatchSMS(
          apt.patientPhone,
          apt.patientName,
          'patient',
          `MahaAarogya UPDATE: Your appointment at ${apt.hospitalName} has been RESCHEDULED to ${apt.date} at ${apt.timeSlot}. Token: ${apt.tokenNumber}. Reason: ${apt.cancellationReason || 'Doctor duty shift'}.`,
          'Appointment'
        );
      }
    } else if (newStatus === 'CANCELLED') {
      if (role === 'patient') {
        // 1. Patient cancellation confirmation SMS
        this.dispatchSMS(
          apt.patientPhone,
          apt.patientName,
          'patient',
          `MahaAarogya NOTICE: Dear ${apt.patientName}, your appointment ${apt.tokenNumber} on ${apt.date} at ${apt.hospitalName} has been CANCELLED as per your request. Reason: "${apt.cancellationReason || 'Patient cancelled'}". OPD slot has been freed.`,
          'Appointment'
        );
        // 2. Doctor Notification SMS
        this.dispatchSMS(
          '9822019900',
          apt.doctorName,
          'doctor',
          `MahaAarogya OPD ALERT: Patient ${apt.patientName} (${apt.tokenNumber}) CANCELLED their appointment for ${apt.date} at ${apt.timeSlot}. Reason: "${apt.cancellationReason || 'Patient requested cancellation'}". Slot released in your OPD schedule.`,
          'Appointment'
        );
        // 3. Hospital Staff Notification SMS
        this.dispatchSMS(
          '02112-255100',
          `${apt.hospitalName} OPD Reception`,
          'staff',
          `HOSPITAL ALERT: Appointment ${apt.tokenNumber} CANCELLED by patient ${apt.patientName} for Dr. ${apt.doctorName} on ${apt.date}. Reason: "${apt.cancellationReason || 'Patient request'}". OPD slot freed up for walk-in patients.`,
          'Appointment'
        );
      } else {
        this.dispatchSMS(
          apt.patientPhone,
          apt.patientName,
          'patient',
          `MahaAarogya NOTICE: Appointment ${apt.id} at ${apt.hospitalName} was CANCELLED. Reason: ${apt.cancellationReason || 'Administrative reschedule'}. Please rebook or call 108 for emergency.`,
          'Appointment'
        );
      }
    } else if (newStatus === 'REJECTED_BY_HOSPITAL' || newStatus === 'DOCTOR_UNAVAILABLE') {
      const altOptionsText = altSlot
        ? `Would you like: [1] Same doctor another day, or [2] Same day another doctor? Offered slot: ${altSlot}. Reply 1 or 2 or re-book via portal.`
        : `Would you like: [1] Same doctor another day, or [2] Same day another doctor? Please visit MahaAarogya portal or ask your village ASHA to pick your preference.`;

      this.dispatchSMS(
        apt.patientPhone,
        apt.patientName,
        'patient',
        `MahaAarogya ALERT: Dear ${apt.patientName}, your appointment request ${apt.id} at ${apt.hospitalName} was REJECTED by hospital staff. Reason: "${rejReason || 'Doctor on emergency duty / OPD slot full'}". ${altOptionsText}`,
        'Appointment'
      );
    } else if (newStatus === 'PATIENT_ARRIVED' || newStatus === 'ARRIVED') {
      this.dispatchSMS(
        apt.patientPhone,
        apt.patientName,
        'patient',
        `MahaAarogya: Arrival verified at ${apt.hospitalName}. Token ${apt.tokenNumber} is now active in OPD queue. Assigned to ${apt.roomAssigned || 'Room 3'}.`,
        'Appointment'
      );
    } else if (newStatus === 'COMPLETED' && apt.prescription) {
      this.dispatchSMS(
        apt.patientPhone,
        apt.patientName,
        'patient',
        `MahaAarogya: Consultation completed with ${apt.doctorName}. Prescription RX-${apt.prescription.id} is now available in your portal and sent to e-Aushadhi dispensary.`,
        'Prescription'
      );
    }

    this.persist();
    return apt;
  }

  public attachPrescription(
    appointmentId: string,
    doctorName: string,
    doctorRegNo: string,
    openNotes: string,
    closedNotes: string,
    medicines: any[],
    suggestedFollowUpDays?: number
  ): Prescription | null {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) return null;

    const rx: Prescription = {
      id: `RX-${Date.now().toString().slice(-4)}`,
      appointmentId,
      patientId: apt.patientId,
      patientName: apt.patientName,
      doctorName,
      doctorRegistrationNo: doctorRegNo,
      hospitalName: apt.hospitalName,
      date: new Date().toISOString().split('T')[0],
      openNotes,
      closedNotes,
      medicines,
      suggestedFollowUpDays
    };

    apt.prescription = rx;
    apt.status = 'COMPLETED';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    apt.statusHistory.push({
      stage: 'CONSULTATION_COMPLETED',
      timestamp: timeStr,
      updatedBy: doctorName,
      role: 'doctor',
      hospitalName: apt.hospitalName,
      notes: `Clinical notes and ${medicines.length} medications prescribed.`
    });

    apt.statusHistory.push({
      stage: 'COMPLETED',
      timestamp: timeStr,
      updatedBy: doctorName,
      role: 'doctor',
      hospitalName: apt.hospitalName,
      notes: 'Consultation lifecycle completed successfully.'
    });

    // If follow-up suggested, register follow-up alert
    if (suggestedFollowUpDays && suggestedFollowUpDays > 0) {
      const dueDate = new Date(Date.now() + suggestedFollowUpDays * 86400000).toISOString().split('T')[0];
      this.highRiskAlerts.unshift({
        id: `HRA-${Date.now().toString().slice(-4)}`,
        patientId: apt.patientId,
        patientName: apt.patientName,
        patientPhone: apt.patientPhone,
        village: 'Morgaon',
        category: 'FollowUpDue',
        condition: `Doctor Follow-up: ${openNotes.slice(0, 45)}...`,
        priority: suggestedFollowUpDays <= 5 ? 'HIGH' : 'MEDIUM',
        dueDate,
        assignedAshaId: apt.assistedByAshaId || 'ASHA-MH-PN-042',
        notes: `Dr. ${doctorName} scheduled review in ${suggestedFollowUpDays} days.`,
        status: 'PENDING'
      });
    }

    this.addAuditLog(doctorName, 'doctor', 'GENERATE_PRESCRIPTION', rx.id, `Prescription generated for ${apt.patientName}. Attached to longitudinal health record.`);
    this.dispatchSMS(
      apt.patientPhone,
      apt.patientName,
      'patient',
      `MahaAarogya: Prescription ${rx.id} generated by Dr. ${doctorName}. Available in your portal. Medicines: ${medicines.map(m => m.medicineName).join(', ')}.`,
      'Prescription'
    );

    this.persist();
    return rx;
  }

  // --- Hospitals & Facility Status ---
  public getHospitals(): HospitalFacility[] {
    return this.hospitals;
  }

  public updateHospitalBeds(hospitalId: string, availableBeds: number, totalBeds?: number, emergencyStatus?: 'Accepting' | 'Temporarily Unavailable') {
    const hosp = this.hospitals.find(h => h.id === hospitalId);
    if (hosp) {
      hosp.availableBeds = availableBeds;
      if (totalBeds !== undefined) hosp.totalBeds = totalBeds;
      hosp.occupiedBeds = Math.max(0, hosp.totalBeds - hosp.availableBeds);
      if (emergencyStatus) hosp.emergencyStatus = emergencyStatus;
      this.addAuditLog('Hospital Incharge', 'staff', 'UPDATE_BED_CAPACITY', hospitalId, `Updated capacity: ${hosp.availableBeds} beds available. Emergency status: ${hosp.emergencyStatus}`);
      this.persist();
    }
  }

  public updateDiagnosticStatus(hospitalId: string, diagnostic: 'bloodTest' | 'xRay' | 'ultrasound' | 'mri', status: 'Available' | 'Limited' | 'Unavailable') {
    const hosp = this.hospitals.find(h => h.id === hospitalId);
    if (hosp) {
      hosp.diagnostics[diagnostic] = status;
      this.addAuditLog('Staff Lab Technician', 'staff', 'UPDATE_DIAGNOSTICS', hospitalId, `Updated ${diagnostic} status to ${status}`);
      this.persist();
    }
  }

  // --- Doctors ---
  public getDoctors(): Doctor[] {
    return this.doctors;
  }

  public updateDoctorStatus(doctorId: string, status: 'Available' | 'On Leave' | 'Emergency Duty') {
    const doc = this.doctors.find(d => d.id === doctorId);
    if (doc) {
      doc.status = status;
      this.addAuditLog(doc.name, 'doctor', 'UPDATE_DOCTOR_AVAILABILITY', doctorId, `Doctor status set to ${status}`);
      this.persist();
    }
  }

  public importDoctorSlotsFromCSV(rows: any[]): { successCount: number; failedCount: number; errors: string[] } {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    rows.forEach((row, idx) => {
      if (!row.doctorName || !row.department || !row.timeSlot) {
        failedCount++;
        errors.push(`Row ${idx + 1}: Missing required fields (Doctor Name, Department, or Slot)`);
        return;
      }
      const existing = this.doctors.find(d => d.name.toLowerCase().includes(row.doctorName.toLowerCase()));
      if (existing) {
        if (!existing.slots.includes(row.timeSlot)) {
          existing.slots.push(row.timeSlot);
        }
        successCount++;
      } else {
        this.doctors.push({
          id: `DOC-MH-${Math.floor(10 + Math.random() * 89)}`,
          name: row.doctorName,
          regNumber: row.regNumber || 'MMC-2024-PENDING',
          specialty: row.department,
          hospitalId: 'HOSP-PHC-MOR',
          hospitalName: row.hospitalName || 'Primary Health Centre (PHC) Morgaon',
          experienceYears: 5,
          availableDays: ['Mon', 'Wed', 'Fri'],
          slots: [row.timeSlot],
          status: 'Available'
        });
        successCount++;
      }
    });

    this.addAuditLog('Hospital Admin', 'staff', 'CSV_SLOT_IMPORT', 'DoctorSlots', `Imported ${successCount} doctor slots from CSV. ${failedCount} errors.`);
    this.persist();
    return { successCount, failedCount, errors };
  }

  // --- Vaccinations ---
  public getVaccinations(): VaccinationBooking[] {
    return this.vaccinations;
  }

  public scheduleVaccinationBooking(data: Omit<VaccinationBooking, 'id' | 'tokenNumber' | 'status' | 'smsSent'>): VaccinationBooking {
    const id = `VAC-2026-${Math.floor(10 + Math.random() * 89)}`;
    const tokenNumber = `V-${Math.floor(10 + Math.random() * 89)}`;

    const newVac: VaccinationBooking = {
      ...data,
      id,
      tokenNumber,
      status: 'SCHEDULED',
      smsSent: true
    };

    this.vaccinations.unshift(newVac);
    this.addAuditLog(data.patientName, 'patient', 'SCHEDULE_VACCINATION', id, `U-WIN vaccination scheduled for ${data.vaccineName} on ${data.date} at ${data.centreName}`);

    // Send SMS
    const phone = data.isChild ? '9421087654' : '9765412309';
    this.dispatchSMS(
      phone,
      data.patientName,
      'patient',
      `U-WIN Immunization: Vaccination scheduled for ${data.patientName} (${data.vaccineName}, Dose ${data.doseNumber}) on ${data.date} at ${data.centreName}. Token: ${tokenNumber}.`,
      'Vaccination'
    );

    this.persist();
    return newVac;
  }

  public markVaccinationCompleted(vaccinationId: string) {
    const v = this.vaccinations.find(vac => vac.id === vaccinationId);
    if (v) {
      v.status = 'COMPLETED';
      this.addAuditLog('ANM / Staff Nurse', 'staff', 'COMPLETE_VACCINATION', vaccinationId, `Administered ${v.vaccineName} dose ${v.doseNumber} to ${v.patientName}`);
      this.persist();
    }
  }

  // --- Referrals ---
  public getReferrals(): Referral[] {
    return this.referrals;
  }

  public createReferral(data: any): Referral {
    const id = `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fromHospital = data.fromHospital || data.sourceHospitalName || 'Primary Health Centre (PHC) Morgaon';
    const toHospital = data.toHospital || data.targetHospitalName || 'Rural Hospital Baramati';
    const referredByDoctor = data.referredByDoctor || data.referringDoctorName || 'Dr. Aniruddha Kulkarni';
    const department = data.department || data.specialtyRequired || 'General Medicine';
    const reason = data.reason || data.clinicalSummary || 'Clinical Referral';
    const priority = data.priority || (data.urgency === 'URGENT' ? 'HIGH' : data.urgency) || 'HIGH';

    const newRef: Referral = {
      ...data,
      id,
      fromHospital,
      toHospital,
      referredByDoctor,
      department,
      reason,
      priority,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      qrCodeData: `REF:${id}:FROM:${fromHospital}:TO:${toHospital}:PAT:${data.patientId}`,
      isEscalated: false
    };

    this.referrals.unshift(newRef);
    this.addAuditLog(referredByDoctor, 'doctor', 'CREATE_REFERRAL', id, `Referral created: ${fromHospital} -> ${toHospital} for ${data.patientName} (${reason})`);

    this.dispatchSMS(
      data.patientPhone || '9822014589',
      data.patientName,
      'patient',
      `MahaAarogya: Clinical referral ${id} created from ${fromHospital} to ${toHospital}. Priority: ${priority}. Present QR at receiving hospital.`,
      'Referral'
    );

    this.persist();
    return newRef;
  }

  public updateReferralStatus(referralId: string, status: Referral['status'], notes?: string) {
    const r = this.referrals.find(ref => ref.id === referralId);
    if (r) {
      r.status = status;
      r.updatedAt = new Date().toISOString();
      this.addAuditLog('Referral Coordinator', 'staff', `REFERRAL_${status}`, referralId, notes || `Referral transitioned to ${status}`);
      this.persist();
    }
  }

  // --- High Risk & Maternal ---
  public getHighRiskAlerts(): HighRiskAlert[] {
    return this.highRiskAlerts;
  }

  public updateHighRiskStatus(alertId: string, status: 'ATTENDED' | 'PENDING') {
    const a = this.highRiskAlerts.find(alt => alt.id === alertId);
    if (a) {
      a.status = status;
      this.addAuditLog('Surekha Tai Shinde', 'asha', 'ATTEND_HIGH_RISK', alertId, `ASHA worker completed home follow-up for ${a.patientName}`);
      this.persist();
    }
  }

  public getMaternalRecords(): MaternalRecord[] {
    return this.maternalRecords;
  }

  // Reset to initial seed data for demonstration
  public resetToDemoSeed() {
    this.patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
    this.appointments = JSON.parse(JSON.stringify(INITIAL_APPOINTMENTS));
    this.hospitals = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
    this.doctors = JSON.parse(JSON.stringify(INITIAL_DOCTORS));
    this.vaccinations = JSON.parse(JSON.stringify(INITIAL_VACCINATIONS));
    this.referrals = JSON.parse(JSON.stringify(INITIAL_REFERRALS));
    this.highRiskAlerts = JSON.parse(JSON.stringify(INITIAL_HIGH_RISK_ALERTS));
    this.maternalRecords = JSON.parse(JSON.stringify(INITIAL_MATERNAL));
    this.smsLogs = JSON.parse(JSON.stringify(INITIAL_SMS_LOGS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.persist();
  }

  public resetToSeedData() {
    this.resetToDemoSeed();
  }

  public isOfflineMode(): boolean {
    return this.isOffline;
  }

  public setOfflineMode(force: boolean): boolean {
    return this.toggleOfflineMode(force);
  }

  public getOfflineQueue(): any[] {
    return this.pendingOfflineQueue;
  }

  public getAdminStats() {
    return {
      totalAppointments: this.appointments.length,
      completedAppointments: this.appointments.filter(a => a.status === 'COMPLETED').length,
      ashaAssistedCount: this.appointments.filter(a => !!a.assistedByAshaId).length,
      eConsultationsCount: this.appointments.filter(a => a.isEConsultation).length,
      totalReferrals: this.referrals.length,
      completedReferrals: this.referrals.filter(r => r.status === 'COMPLETED').length,
      highRiskCount: this.highRiskAlerts.length
    };
  }

  public completeConsultation(appointmentId: string, rx: Prescription, doctorName: string) {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) return null;

    apt.prescription = rx;
    apt.status = 'COMPLETED';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    apt.statusHistory.push({
      stage: 'CONSULTATION_COMPLETED',
      timestamp: timeStr,
      updatedBy: doctorName,
      role: 'doctor',
      hospitalName: apt.hospitalName,
      notes: `Clinical notes and ${rx.medicines.length} medications prescribed.`
    });

    apt.statusHistory.push({
      stage: 'COMPLETED',
      timestamp: timeStr,
      updatedBy: doctorName,
      role: 'doctor',
      hospitalName: apt.hospitalName,
      notes: 'Consultation lifecycle completed successfully.'
    });

    this.addAuditLog(doctorName, 'doctor', 'GENERATE_PRESCRIPTION', rx.id, `Prescription generated for ${apt.patientName}. Attached to longitudinal health record.`);
    this.dispatchSMS(
      apt.patientPhone,
      apt.patientName,
      'patient',
      `MahaAarogya: Prescription ${rx.id} generated by Dr. ${doctorName}. Available in your portal. Medicines: ${rx.medicines.map(m => m.medicineName).join(', ')}.`,
      'Prescription'
    );

    this.persist();
    return rx;
  }
}

export const storageService = new StorageService();
