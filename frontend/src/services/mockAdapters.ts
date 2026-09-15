/**
 * Interoperability Service Adapters for Government of India & Maharashtra Healthcare Systems
 * Structured according to ABDM (Ayushman Bharat Digital Mission) and standard MOHFW protocols.
 */

// ==========================================
// 1. ABHA Service (Ayushman Bharat Health Account)
// ==========================================
export interface IAbhaService {
  verifyAadhaarOTP(aadhaarLast4: string, otp: string): Promise<{ success: boolean; abhaId: string; abhaAddress: string; error?: string }>;
  generateAbhaCard(patientData: any): Promise<{ abhaId: string; abhaAddress: string; qrCodeData: string }>;
  linkExistingAbha(abhaId: string): Promise<{ verified: boolean; profile?: any; error?: string }>;
}

export class AbhaServiceAdapter implements IAbhaService {
  private isProduction = false; // Toggle to true when ABDM Gateway credentials are configured in .env

  async verifyAadhaarOTP(aadhaarLast4: string, otp: string) {
    if (this.isProduction) {
      // Production ABDM Gateway integration placeholder:
      // POST https://abhasbx.abdm.gov.in/v1/auth/confirmWithAadhaarOtp
      throw new Error('Production ABDM endpoint requires NDHM client credentials.');
    }
    // Simulation logic: accept OTP '123456' or any 6-digit number
    if (otp && otp.length === 6) {
      const generatedAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${aadhaarLast4}`;
      return {
        success: true,
        abhaId: generatedAbha,
        abhaAddress: `user${aadhaarLast4}@abdm`
      };
    }
    return { success: false, abhaId: '', abhaAddress: '', error: 'Invalid Aadhaar OTP. Please enter a valid 6-digit OTP.' };
  }

  async generateAbhaCard(patientData: any) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const abhaId = `91-7482-9014-${randomSuffix}`;
    return {
      abhaId,
      abhaAddress: `${patientData.fullName?.toLowerCase().replace(/\s+/g, '')}${randomSuffix}@abdm`,
      qrCodeData: `ABDM:ABHA:${abhaId}:NAME:${patientData.fullName}:DOB:${patientData.dob}`
    };
  }

  async linkExistingAbha(abhaId: string) {
    if (!abhaId || abhaId.length < 10) {
      return { verified: false, error: 'ABHA format must follow 14-digit format or PHR address.' };
    }
    return {
      verified: true,
      profile: {
        abhaId,
        status: 'LINKED_ABDM_VERIFIED',
        registeredAt: new Date().toISOString()
      }
    };
  }
}

// ==========================================
// 2. U-WIN Service (Universal Immunization)
// ==========================================
export interface EligibleVaccine {
  vaccineName: string;
  targetGroup: string;
  doseNumber: number;
  diseaseProtected: string;
  dueAgeWeeks: number;
  isMandatory: boolean;
}

export interface IUWinService {
  getEligibleVaccines(patientAgeYears: number, isChild: boolean): Promise<EligibleVaccine[]>;
  getVaccinationCentres(district: string): Promise<{ id: string; name: string; address: string; openSlots: number }[]>;
  scheduleVaccination(data: any): Promise<{ bookingId: string; token: string; qrCode: string }>;
}

export class UWinServiceAdapter implements IUWinService {
  private isProduction = false;

  async getEligibleVaccines(patientAgeYears: number, isChild: boolean): Promise<EligibleVaccine[]> {
    if (isChild || patientAgeYears < 12) {
      return [
        { vaccineName: 'BCG', targetGroup: 'Infants (At Birth)', doseNumber: 1, diseaseProtected: 'Tuberculosis', dueAgeWeeks: 0, isMandatory: true },
        { vaccineName: 'OPV (Oral Polio)', targetGroup: 'Infants (Birth / 6 weeks)', doseNumber: 1, diseaseProtected: 'Poliomyelitis', dueAgeWeeks: 6, isMandatory: true },
        { vaccineName: 'Pentavalent (DPT-HepB-Hib)', targetGroup: 'Infants (6, 10, 14 weeks)', doseNumber: 1, diseaseProtected: 'Diphtheria, Pertussis, Tetanus, Hep B, Hib', dueAgeWeeks: 6, isMandatory: true },
        { vaccineName: 'Rotavirus Vaccine (RVV)', targetGroup: 'Infants (6, 10 weeks)', doseNumber: 2, diseaseProtected: 'Rotaviral Diarrhea', dueAgeWeeks: 10, isMandatory: true },
        { vaccineName: 'MR (Measles & Rubella)', targetGroup: 'Children (9-12 Months)', doseNumber: 1, diseaseProtected: 'Measles & Rubella', dueAgeWeeks: 40, isMandatory: true },
        { vaccineName: 'DPT Booster 1', targetGroup: 'Toddlers (16-24 Months)', doseNumber: 1, diseaseProtected: 'DPT Booster', dueAgeWeeks: 72, isMandatory: false }
      ];
    }
    // Adults / Adolescents
    return [
      { vaccineName: 'Tetanus & adult Diphtheria (Td)', targetGroup: 'Adolescents & Adults', doseNumber: 1, diseaseProtected: 'Tetanus, Diphtheria', dueAgeWeeks: 520, isMandatory: true },
      { vaccineName: 'Hepatitis B (Adult Series)', targetGroup: 'Adults & High-Risk', doseNumber: 1, diseaseProtected: 'Hepatitis B', dueAgeWeeks: 0, isMandatory: false },
      { vaccineName: 'Influenza (Seasonal Flu)', targetGroup: 'Elderly & Chronic', doseNumber: 1, diseaseProtected: 'Seasonal Flu', dueAgeWeeks: 0, isMandatory: false }
    ];
  }

  async getVaccinationCentres(district: string) {
    return [
      { id: 'phc-morgaon', name: 'Primary Health Centre (PHC) Morgaon', address: 'Morgaon Taluka, Pune Dist.', openSlots: 24 },
      { id: 'phc-saswad', name: 'Sub-District Hospital (SDH) Saswad', address: 'Saswad Highway Road, Pune', openSlots: 15 },
      { id: 'rh-baramati', name: 'Rural Hospital (RH) Baramati', address: 'Medical College Road, Baramati', openSlots: 32 },
      { id: 'phc-shirwal', name: 'PHC Shirwal Center', address: 'Shirwal Rural Junction, Satara', openSlots: 18 }
    ];
  }

  async scheduleVaccination(data: any) {
    const bookingId = `UWIN-${Math.floor(100000 + Math.random() * 900000)}`;
    const token = `V-${Math.floor(10 + Math.random() * 89)}`;
    return {
      bookingId,
      token,
      qrCode: `UWIN:BID:${bookingId}:PATIENT:${data.patientName}:VAC:${data.vaccineName}`
    };
  }
}

// ==========================================
// 3. eSanjeevani Service (National Telemedicine)
// ==========================================
export interface IESanjeevaniService {
  checkDoctorAvailability(specialty: string): Promise<{ availableDoctors: number; estimatedWaitMins: number }>;
  initiateTeleconsultation(appointmentId: string, patientName: string): Promise<{ roomUrl: string; sessionId: string; passCode: string }>;
}

export class ESanjeevaniServiceAdapter implements IESanjeevaniService {
  async checkDoctorAvailability(specialty: string) {
    return {
      availableDoctors: 4,
      estimatedWaitMins: 8
    };
  }

  async initiateTeleconsultation(appointmentId: string, patientName: string) {
    const sessionId = `ESANJ-${Date.now().toString().slice(-6)}`;
    return {
      roomUrl: `https://esanjeevaniopd.in/consult?room=${sessionId}&user=${encodeURIComponent(patientName)}`,
      sessionId,
      passCode: Math.floor(100000 + Math.random() * 900000).toString()
    };
  }
}

// ==========================================
// 4. e-Aushadhi Service (Drug Supply Chain)
// ==========================================
export interface IEaushadhiService {
  searchMedicineStock(medicineName: string, district: string): Promise<any[]>;
}

export class EAushadhiServiceAdapter implements IEaushadhiService {
  async searchMedicineStock(medicineName: string, district: string) {
    // Simulated live inventory connected to Maharashtra State Health Dept Drug Depot
    const sampleStocks = [
      {
        brandName: 'Paracetamol Tablets IP 500mg',
        genericName: 'Paracetamol',
        category: 'Analgesic / Antipyretic',
        dosageForm: '10x10 Tablets Strip',
        facilityName: 'PHC Morgaon Central Dispensary',
        facilityType: 'PHC Sub-Store',
        stock: 340,
        distanceKm: 3.2,
        phone: '02112-255100',
        lastUpdated: 'Today, 08:30 AM'
      },
      {
        brandName: 'Amoxicillin Trihydrate 500mg',
        genericName: 'Amoxicillin',
        category: 'Antibiotic',
        dosageForm: 'Capsules',
        facilityName: 'Rural Hospital Baramati Warehouse',
        facilityType: 'Rural Hospital Depot',
        stock: 180,
        distanceKm: 14.5,
        phone: '02112-222340',
        lastUpdated: 'Yesterday'
      },
      {
        brandName: 'Metformin Hydrochloride 500mg',
        genericName: 'Metformin',
        category: 'Antidiabetic',
        dosageForm: 'Tablets',
        facilityName: 'Pradhan Mantri Jan Aushadhi Kendra, Saswad',
        facilityType: 'Jan Aushadhi Kendra',
        stock: 520,
        distanceKm: 8.1,
        phone: '02115-224411',
        lastUpdated: 'Today, 10:15 AM'
      },
      {
        brandName: 'Iron & Folic Acid (IFA) Tablets',
        genericName: 'Ferrous Sulfate + Folic Acid',
        category: 'Maternal Nutrition',
        dosageForm: 'Tablets',
        facilityName: 'PHC Morgaon Sub-Centre',
        facilityType: 'Sub-Centre',
        stock: 1200,
        distanceKm: 2.0,
        phone: '02112-255102',
        lastUpdated: 'Today, 09:00 AM'
      }
    ];

    if (!medicineName) return sampleStocks;
    return sampleStocks.filter(item =>
      item.brandName.toLowerCase().includes(medicineName.toLowerCase()) ||
      item.genericName.toLowerCase().includes(medicineName.toLowerCase()) ||
      item.category.toLowerCase().includes(medicineName.toLowerCase())
    );
  }
}

// ==========================================
// 5. Twilio SMS Service & Voice Dispatcher
// ==========================================
export interface ITwilioService {
  sendSMS(phone: string, text: string, category?: string): Promise<{ success: boolean; messageId: string }>;
}

export class TwilioServiceAdapter implements ITwilioService {
  private hasCredentials = false; // Set to true if process.env.TWILIO_ACCOUNT_SID is provided

  async sendSMS(phone: string, text: string, category: string = 'Notification') {
    // In production, invoke Twilio REST API via backend:
    // client.messages.create({ body: text, to: phone, from: process.env.TWILIO_PHONE_NUMBER })
    const messageId = `SM${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    return {
      success: true,
      messageId
    };
  }
}

export class VoiceNotificationAdapter {
  async triggerVoiceCall(phone: string, messageText: string, language: string = 'mr') {
    // Dispatches automated IVR outbound voice call
    return {
      callId: `CA${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      status: 'QUEUED_IVR_DISPATCH',
      language,
      phone
    };
  }
}

// Singleton instances
export const abhaService = new AbhaServiceAdapter();
export const uwinService = new UWinServiceAdapter();
export const eSanjeevaniService = new ESanjeevaniServiceAdapter();
export const eaushadhiService = new EAushadhiServiceAdapter();
export const twilioService = new TwilioServiceAdapter();
export const voiceService = new VoiceNotificationAdapter();
