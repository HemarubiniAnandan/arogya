import { Router } from 'express';
import { getPatients, getPatientById, verifyOtp } from '../controllers/patientController.js';
import { getAppointments, createAppointment, updateAppointmentStatus, completeConsultation } from '../controllers/appointmentController.js';
import { getReferrals, createReferral, updateReferralStatus } from '../controllers/referralController.js';
import { getHospitals, updateBeds } from '../controllers/hospitalController.js';
import { getDoctors } from '../controllers/doctorController.js';
import { getSmsLogs, dispatchSms } from '../controllers/smsController.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'UP', platform: 'AarogyaRakshak 2.0 Backend', database: 'SQLite database.sqlite' });
});

// Patients
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientById);
router.post('/patients/verify-otp', verifyOtp);

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.post('/appointments/:id/complete', completeConsultation);

// Referrals
router.get('/referrals', getReferrals);
router.post('/referrals', createReferral);
router.patch('/referrals/:id/status', updateReferralStatus);

// Hospitals
router.get('/hospitals', getHospitals);
router.patch('/hospitals/:id/beds', updateBeds);

// Doctors
router.get('/doctors', getDoctors);

// SMS & Notifications
router.get('/sms-logs', getSmsLogs);
router.post('/sms-dispatch', dispatchSms);

export default router;
