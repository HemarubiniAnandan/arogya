const API_BASE_URL = 'http://localhost:5000/api';

export const apiService = {
  // Check Backend Health
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Patients
  async getPatients(searchQuery: string = '') {
    const url = searchQuery ? `${API_BASE_URL}/patients?q=${encodeURIComponent(searchQuery)}` : `${API_BASE_URL}/patients`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch patients from DB');
    return await res.json();
  },

  async updatePatient(patientId: string, updates: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  async verifyOtp(patientId: string, otp: string) {
    const res = await fetch(`${API_BASE_URL}/patients/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, otp })
    });
    return await res.json();
  },

  // Appointments
  async getAppointments() {
    const res = await fetch(`${API_BASE_URL}/appointments`);
    if (!res.ok) throw new Error('Failed to fetch appointments from DB');
    return await res.json();
  },

  async createAppointment(appointmentData: any) {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    if (!res.ok) throw new Error('Failed to create appointment in DB');
    return await res.json();
  },

  async updateAppointmentStatus(id: string, status: string, updatedBy?: string, role?: string, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, updatedBy, role, notes })
    });
    return await res.json();
  },

  async completeConsultation(appointmentId: string, prescription: any, doctorName: string) {
    const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prescription, doctorName })
    });
    return await res.json();
  },

  // Referrals
  async getReferrals() {
    const res = await fetch(`${API_BASE_URL}/referrals`);
    if (!res.ok) throw new Error('Failed to fetch referrals from DB');
    return await res.json();
  },

  async createReferral(referralData: any) {
    const res = await fetch(`${API_BASE_URL}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referralData)
    });
    return await res.json();
  },

  async updateReferralStatus(id: string, status: string, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/referrals/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    return await res.json();
  },

  // Hospitals
  async getHospitals() {
    const res = await fetch(`${API_BASE_URL}/hospitals`);
    if (!res.ok) throw new Error('Failed to fetch hospitals from DB');
    return await res.json();
  },

  async updateBeds(hospitalId: string, availableBeds: number, occupiedBeds: number, icuBedsAvailable: number, oxygenBedsAvailable: number) {
    const res = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/beds`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availableBeds, occupiedBeds, icuBedsAvailable, oxygenBedsAvailable })
    });
    return await res.json();
  },

  // Doctors
  async getDoctors() {
    const res = await fetch(`${API_BASE_URL}/doctors`);
    if (!res.ok) throw new Error('Failed to fetch doctors from DB');
    return await res.json();
  },

  // SMS & Voice Logs
  async getSmsLogs() {
    const res = await fetch(`${API_BASE_URL}/sms-logs`);
    if (!res.ok) throw new Error('Failed to fetch SMS logs from DB');
    return await res.json();
  },

  async dispatchSms(smsData: any) {
    const res = await fetch(`${API_BASE_URL}/sms-dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsData)
    });
    return await res.json();
  }
};
