import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite Database at: ${dbPath}`);
  }
});

// Helper for promise-based db queries
export const dbQuery = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbRun = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const initDatabase = async () => {
  // Table 1: Patients
  await dbRun(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      dob TEXT,
      age INTEGER,
      gender TEXT,
      aadhaarMasked TEXT,
      abhaId TEXT,
      guardianName TEXT,
      guardianContact TEXT,
      address TEXT,
      state TEXT,
      district TEXT,
      village TEXT,
      pincode TEXT,
      chronicConditions TEXT,
      allergies TEXT,
      currentMedications TEXT,
      emergencyContact TEXT,
      consent TEXT,
      registeredViaAshaId TEXT,
      isHighRisk INTEGER DEFAULT 0,
      highRiskCategory TEXT
    )
  `);

  // Table 2: Appointments
  await dbRun(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      tokenNumber TEXT,
      patientId TEXT,
      patientName TEXT,
      patientAge INTEGER,
      patientGender TEXT,
      patientPhone TEXT,
      hospitalId TEXT,
      hospitalName TEXT,
      hospitalType TEXT,
      department TEXT,
      doctorId TEXT,
      doctorName TEXT,
      date TEXT,
      timeSlot TEXT,
      chiefComplaint TEXT,
      suggestedDepartmentByNLP TEXT,
      isEmergencyAlert INTEGER DEFAULT 0,
      isEConsultation INTEGER DEFAULT 0,
      assistedByAshaId TEXT,
      assistedByAshaName TEXT,
      status TEXT,
      statusHistory TEXT,
      rejectionReason TEXT,
      alternateSlotOffered TEXT,
      roomAssigned TEXT,
      queuePosition INTEGER,
      estimatedWaitMins INTEGER,
      cancellationReason TEXT,
      prescription TEXT,
      qrCodeData TEXT,
      createdAt TEXT
    )
  `);

  // Table 3: Referrals
  await dbRun(`
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      patientId TEXT,
      patientName TEXT,
      patientAge INTEGER,
      patientPhone TEXT,
      fromHospital TEXT,
      sourceHospitalId TEXT,
      sourceHospitalName TEXT,
      toHospital TEXT,
      targetHospitalId TEXT,
      targetHospitalName TEXT,
      referredByDoctor TEXT,
      referringDoctorName TEXT,
      department TEXT,
      specialtyRequired TEXT,
      reason TEXT,
      clinicalSummary TEXT,
      priority TEXT,
      urgency TEXT,
      status TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      rejectionReason TEXT,
      qrCodeData TEXT,
      isEscalated INTEGER DEFAULT 0
    )
  `);

  // Table 4: Hospitals
  await dbRun(`
    CREATE TABLE IF NOT EXISTS hospitals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      district TEXT,
      taluka TEXT,
      address TEXT,
      distanceKm REAL,
      emergencyStatus TEXT,
      totalBeds INTEGER,
      availableBeds INTEGER,
      occupiedBeds INTEGER,
      icuBedsAvailable INTEGER,
      oxygenBedsAvailable INTEGER,
      departments TEXT,
      diagnostics TEXT,
      contactPhone TEXT
    )
  `);

  // Table 5: Doctors
  await dbRun(`
    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      regNumber TEXT,
      specialty TEXT,
      hospitalId TEXT,
      hospitalName TEXT,
      experienceYears INTEGER,
      availableDays TEXT,
      slots TEXT,
      status TEXT
    )
  `);

  // Table 6: SMS & Voice Logs
  await dbRun(`
    CREATE TABLE IF NOT EXISTS sms_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT,
      recipientPhone TEXT,
      recipientName TEXT,
      role TEXT,
      message TEXT,
      category TEXT,
      status TEXT
    )
  `);

  // Seed Data if empty
  const patientCount = await dbQuery('SELECT COUNT(*) as count FROM patients');
  if (patientCount[0].count === 0) {
    console.log('Seeding SQLite database with mock rural healthcare dataset...');
    await seedDatabase();
  }
};

const seedDatabase = async () => {
  // Seed Patients
  const mockPatients = [
    {
      id: 'PT-MH-9021',
      fullName: 'Ramesh Tanaji Jadhav',
      phone: '+91 98220 12345',
      email: 'ramesh.j@ruralhealth.org',
      dob: '1982-05-14',
      age: 44,
      gender: 'Male',
      aadhaarMasked: 'XXXX-XXXX-4821',
      abhaId: '91-4412-8819-2041',
      address: 'Near Maruti Temple, Morgaon Village',
      state: 'Maharashtra',
      district: 'Pune',
      village: 'Morgaon',
      pincode: '412304',
      chronicConditions: JSON.stringify(['Type 2 Diabetes', 'Hypertension']),
      allergies: JSON.stringify(['Penicillin']),
      currentMedications: JSON.stringify(['Metformin 500mg', 'Amlodipine 5mg']),
      emergencyContact: JSON.stringify({ name: 'Sujata Jadhav', phone: '+91 98220 12346', relation: 'Wife' }),
      consent: JSON.stringify({ allowAshaAssistance: true, allowRecordSharing: true, allowReferralSharing: true, allowTeleconsultSharing: true }),
      isHighRisk: 1,
      highRiskCategory: 'Chronic'
    },
    {
      id: 'PT-MH-9022',
      fullName: 'Sunita Anand Shinde',
      phone: '+91 94210 98765',
      dob: '1998-11-20',
      age: 27,
      gender: 'Female',
      aadhaarMasked: 'XXXX-XXXX-7192',
      abhaId: '91-8812-9901-5120',
      address: 'Z P School Road, Vadgaon Nimbalkar',
      state: 'Maharashtra',
      district: 'Pune',
      village: 'Vadgaon Nimbalkar',
      pincode: '412305',
      chronicConditions: JSON.stringify(['Gestational Anemia']),
      allergies: JSON.stringify(['Dust']),
      currentMedications: JSON.stringify(['Iron & Folic Acid Tablets']),
      emergencyContact: JSON.stringify({ name: 'Anand Shinde', phone: '+91 94210 98766', relation: 'Husband' }),
      consent: JSON.stringify({ allowAshaAssistance: true, allowRecordSharing: true, allowReferralSharing: true, allowTeleconsultSharing: true }),
      isHighRisk: 1,
      highRiskCategory: 'Maternal'
    },
    {
      id: 'PT-MH-9023',
      fullName: 'Meena Laxman Patil',
      phone: '+91 97654 32109',
      dob: '1970-03-10',
      age: 56,
      gender: 'Female',
      aadhaarMasked: 'XXXX-XXXX-3341',
      abhaId: '91-3301-4491-8820',
      address: 'Kadamwadi, Supe Village',
      state: 'Maharashtra',
      district: 'Pune',
      village: 'Supe',
      pincode: '412310',
      chronicConditions: JSON.stringify(['Asthma']),
      allergies: JSON.stringify(['Sulfa drugs']),
      currentMedications: JSON.stringify(['Salbutamol Inhaler']),
      emergencyContact: JSON.stringify({ name: 'Laxman Patil', phone: '+91 97654 32110', relation: 'Husband' }),
      consent: JSON.stringify({ allowAshaAssistance: true, allowRecordSharing: false, allowReferralSharing: true, allowTeleconsultSharing: true }),
      isHighRisk: 0
    }
  ];

  for (const p of mockPatients) {
    await dbRun(
      `INSERT INTO patients (id, fullName, phone, email, dob, age, gender, aadhaarMasked, abhaId, address, state, district, village, pincode, chronicConditions, allergies, currentMedications, emergencyContact, consent, isHighRisk, highRiskCategory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.fullName, p.phone, p.email, p.dob, p.age, p.gender, p.aadhaarMasked, p.abhaId, p.address, p.state, p.district, p.village, p.pincode, p.chronicConditions, p.allergies, p.currentMedications, p.emergencyContact, p.consent, p.isHighRisk, p.highRiskCategory]
    );
  }

  // Seed Hospitals
  const mockHospitals = [
    {
      id: 'HOSP-PHC-MOR',
      name: 'Primary Health Centre (PHC) Morgaon',
      type: 'PHC',
      district: 'Pune',
      taluka: 'Baramati',
      address: 'Main Road, Morgaon, Tal. Baramati, Dist. Pune - 412304',
      distanceKm: 0,
      emergencyStatus: 'Accepting',
      totalBeds: 12,
      availableBeds: 4,
      occupiedBeds: 8,
      icuBedsAvailable: 0,
      oxygenBedsAvailable: 2,
      departments: JSON.stringify(['General Medicine', 'Maternal & Child Health (ANC/PNC)', 'Immunization', 'Emergency First Aid']),
      diagnostics: JSON.stringify({ bloodTest: 'Available', xRay: 'Limited', ultrasound: 'Unavailable', mri: 'Unavailable' }),
      contactPhone: '+91 2112 284102'
    },
    {
      id: 'HOSP-RH-BAR',
      name: 'Rural Hospital (RH) Baramati',
      type: 'Rural Hospital',
      district: 'Pune',
      taluka: 'Baramati',
      address: 'Near Bus Stand, Baramati, Dist. Pune - 413102',
      distanceKm: 18.5,
      emergencyStatus: 'Accepting',
      totalBeds: 50,
      availableBeds: 14,
      occupiedBeds: 36,
      icuBedsAvailable: 3,
      oxygenBedsAvailable: 8,
      departments: JSON.stringify(['General Surgery', 'Obstetrics & Gynecology', 'Pediatrics', 'Orthopedics', 'ICU']),
      diagnostics: JSON.stringify({ bloodTest: 'Available', xRay: 'Available', ultrasound: 'Available', mri: 'Unavailable' }),
      contactPhone: '+91 2112 222400'
    }
  ];

  for (const h of mockHospitals) {
    await dbRun(
      `INSERT INTO hospitals (id, name, type, district, taluka, address, distanceKm, emergencyStatus, totalBeds, availableBeds, occupiedBeds, icuBedsAvailable, oxygenBedsAvailable, departments, diagnostics, contactPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [h.id, h.name, h.type, h.district, h.taluka, h.address, h.distanceKm, h.emergencyStatus, h.totalBeds, h.availableBeds, h.occupiedBeds, h.icuBedsAvailable, h.oxygenBedsAvailable, h.departments, h.diagnostics, h.contactPhone]
    );
  }

  // Seed Doctors
  const mockDoctors = [
    {
      id: 'DOC-MH-101',
      name: 'Dr. Aniruddha Kulkarni',
      regNumber: 'MMC/2012/04491',
      specialty: 'General Physician & Public Health',
      hospitalId: 'HOSP-PHC-MOR',
      hospitalName: 'Primary Health Centre (PHC) Morgaon',
      experienceYears: 12,
      availableDays: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
      slots: JSON.stringify(['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM']),
      status: 'Available'
    },
    {
      id: 'DOC-MH-102',
      name: 'Dr. Priya Deshmukh',
      regNumber: 'MMC/2015/09120',
      specialty: 'Obstetrics & High Risk Gynecology',
      hospitalId: 'HOSP-RH-BAR',
      hospitalName: 'Rural Hospital (RH) Baramati',
      experienceYears: 9,
      availableDays: JSON.stringify(['Mon', 'Wed', 'Fri']),
      slots: JSON.stringify(['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM']),
      status: 'Available'
    }
  ];

  for (const d of mockDoctors) {
    await dbRun(
      `INSERT INTO doctors (id, name, regNumber, specialty, hospitalId, hospitalName, experienceYears, availableDays, slots, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.name, d.regNumber, d.specialty, d.hospitalId, d.hospitalName, d.experienceYears, d.availableDays, d.slots, d.status]
    );
  }

  // Seed Appointments
  const mockAppointments = [
    {
      id: 'APT-MH-2026-881',
      tokenNumber: 'MH-MOR-001',
      patientId: 'PT-MH-9021',
      patientName: 'Ramesh Tanaji Jadhav',
      patientAge: 44,
      patientGender: 'Male',
      patientPhone: '+91 98220 12345',
      hospitalId: 'HOSP-PHC-MOR',
      hospitalName: 'Primary Health Centre (PHC) Morgaon',
      hospitalType: 'PHC',
      department: 'General Medicine',
      doctorId: 'DOC-MH-101',
      doctorName: 'Dr. Aniruddha Kulkarni',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '09:30 AM',
      chiefComplaint: 'High fever for 3 days with dry cough & severe fatigue',
      suggestedDepartmentByNLP: 'General Medicine',
      isEmergencyAlert: 0,
      assistedByAshaId: 'ASHA-MH-501',
      assistedByAshaName: 'Sunita Gawaye (ASHA Worker)',
      status: 'ARRIVED',
      statusHistory: JSON.stringify([{ stage: 'ARRIVED', timestamp: new Date().toISOString(), updatedBy: 'Sunita Gawaye', role: 'asha', hospitalName: 'PHC Morgaon' }]),
      queuePosition: 1,
      estimatedWaitMins: 10,
      qrCodeData: 'MH-TOKEN-PT-9021-APT-881',
      createdAt: new Date().toISOString()
    },
    {
      id: 'APT-MH-2026-882',
      tokenNumber: 'MH-MOR-002',
      patientId: 'PT-MH-9022',
      patientName: 'Sunita Anand Shinde',
      patientAge: 27,
      patientGender: 'Female',
      patientPhone: '+91 94210 98765',
      hospitalId: 'HOSP-PHC-MOR',
      hospitalName: 'Primary Health Centre (PHC) Morgaon',
      hospitalType: 'PHC',
      department: 'Maternal & Child Health',
      doctorId: 'DOC-MH-101',
      doctorName: 'Dr. Aniruddha Kulkarni',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:15 AM',
      chiefComplaint: '2nd Trimester ANC Checkup & Hb screening (Hb 9.2 g/dL)',
      suggestedDepartmentByNLP: 'Maternal & Child Health',
      isEmergencyAlert: 0,
      assistedByAshaId: 'ASHA-MH-501',
      assistedByAshaName: 'Sunita Gawaye (ASHA Worker)',
      status: 'CONFIRMED',
      statusHistory: JSON.stringify([{ stage: 'CONFIRMED', timestamp: new Date().toISOString(), updatedBy: 'System', role: 'patient', hospitalName: 'PHC Morgaon' }]),
      queuePosition: 2,
      estimatedWaitMins: 25,
      qrCodeData: 'MH-TOKEN-PT-9022-APT-882',
      createdAt: new Date().toISOString()
    }
  ];

  for (const a of mockAppointments) {
    await dbRun(
      `INSERT INTO appointments (id, tokenNumber, patientId, patientName, patientAge, patientGender, patientPhone, hospitalId, hospitalName, hospitalType, department, doctorId, doctorName, date, timeSlot, chiefComplaint, suggestedDepartmentByNLP, isEmergencyAlert, assistedByAshaId, assistedByAshaName, status, statusHistory, queuePosition, estimatedWaitMins, qrCodeData, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.tokenNumber, a.patientId, a.patientName, a.patientAge, a.patientGender, a.patientPhone, a.hospitalId, a.hospitalName, a.hospitalType, a.department, a.doctorId, a.doctorName, a.date, a.timeSlot, a.chiefComplaint, a.suggestedDepartmentByNLP, a.isEmergencyAlert, a.assistedByAshaId, a.assistedByAshaName, a.status, a.statusHistory, a.queuePosition, a.estimatedWaitMins, a.qrCodeData, a.createdAt]
    );
  }

  // Seed Referrals
  const mockReferrals = [
    {
      id: 'REF-MH-7001',
      patientId: 'PT-MH-9022',
      patientName: 'Sunita Anand Shinde',
      patientAge: 27,
      patientPhone: '+91 94210 98765',
      fromHospital: 'Primary Health Centre (PHC) Morgaon',
      sourceHospitalId: 'HOSP-PHC-MOR',
      sourceHospitalName: 'Primary Health Centre (PHC) Morgaon',
      toHospital: 'Rural Hospital (RH) Baramati',
      targetHospitalId: 'HOSP-RH-BAR',
      targetHospitalName: 'Rural Hospital (RH) Baramati',
      referredByDoctor: 'Dr. Aniruddha Kulkarni',
      referringDoctorName: 'Dr. Aniruddha Kulkarni',
      department: 'Obstetrics & High Risk Gynecology',
      specialtyRequired: 'Obstetrics & High Risk Gynecology',
      reason: '2nd Trimester Moderate Anemia & High Risk ANC evaluation',
      clinicalSummary: 'Patient presents with severe fatigue. Hb level 9.2 g/dL. Referred for specialist obstetric review.',
      priority: 'HIGH',
      urgency: 'HIGH',
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      qrCodeData: 'MH-REF-7001-QR-TOKEN'
    }
  ];

  for (const r of mockReferrals) {
    await dbRun(
      `INSERT INTO referrals (id, patientId, patientName, patientAge, patientPhone, fromHospital, sourceHospitalId, sourceHospitalName, toHospital, targetHospitalId, targetHospitalName, referredByDoctor, referringDoctorName, department, specialtyRequired, reason, clinicalSummary, priority, urgency, status, createdAt, updatedAt, qrCodeData) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.patientId, r.patientName, r.patientAge, r.patientPhone, r.fromHospital, r.sourceHospitalId, r.sourceHospitalName, r.toHospital, r.targetHospitalId, r.targetHospitalName, r.referredByDoctor, r.referringDoctorName, r.department, r.specialtyRequired, r.reason, r.clinicalSummary, r.priority, r.urgency, r.status, r.createdAt, r.updatedAt, r.qrCodeData]
    );
  }

  // Seed SMS logs
  const mockSmsLogs = [
    {
      id: 'SMS-101',
      timestamp: new Date().toISOString(),
      recipientPhone: '+91 98220 12345',
      recipientName: 'Ramesh Jadhav',
      role: 'patient',
      message: 'AarogyaRakshak: Your OPD Token MH-MOR-001 for Dr. Aniruddha Kulkarni at PHC Morgaon is confirmed for today 09:30 AM.',
      category: 'Appointment',
      status: 'Delivered'
    }
  ];

  for (const s of mockSmsLogs) {
    await dbRun(
      `INSERT INTO sms_logs (id, timestamp, recipientPhone, recipientName, role, message, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.timestamp, s.recipientPhone, s.recipientName, s.role, s.message, s.category, s.status]
    );
  }

  console.log('SQLite Database Seeding Completed Successfully!');
};
