import { Request, Response } from 'express';
import { dbQuery, dbRun } from '../config/db.js';

export const getReferrals = async (req: Request, res: Response) => {
  try {
    const rows = await dbQuery('SELECT * FROM referrals ORDER BY createdAt DESC');
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createReferral = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const id = data.id || `REF-MH-${Math.floor(7000 + Math.random() * 900)}`;
    const createdAt = new Date().toISOString();
    const qrCodeData = `MH-REF-${id}-QR-TOKEN`;

    await dbRun(
      `INSERT INTO referrals (id, patientId, patientName, patientAge, patientPhone, fromHospital, sourceHospitalId, sourceHospitalName, toHospital, targetHospitalId, targetHospitalName, referredByDoctor, referringDoctorName, department, specialtyRequired, reason, clinicalSummary, priority, urgency, status, createdAt, updatedAt, qrCodeData) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.patientId,
        data.patientName,
        data.patientAge || 30,
        data.patientPhone || '+91 98220 12345',
        data.sourceHospitalName || data.fromHospital || 'Primary Health Centre (PHC) Morgaon',
        data.sourceHospitalId || 'HOSP-PHC-MOR',
        data.sourceHospitalName || 'Primary Health Centre (PHC) Morgaon',
        data.targetHospitalName || data.toHospital || 'Rural Hospital (RH) Baramati',
        data.targetHospitalId || 'HOSP-RH-BAR',
        data.targetHospitalName || 'Rural Hospital (RH) Baramati',
        data.referringDoctorName || data.referredByDoctor || 'Dr. Aniruddha Kulkarni',
        data.referringDoctorName || 'Dr. Aniruddha Kulkarni',
        data.specialtyRequired || data.department || 'General Surgery',
        data.specialtyRequired || 'General Surgery',
        data.clinicalSummary || data.reason || 'Specialist escalation requested',
        data.clinicalSummary || 'Specialist escalation requested',
        data.urgency || data.priority || 'ROUTINE',
        data.urgency || 'ROUTINE',
        'SENT',
        createdAt,
        createdAt,
        qrCodeData
      ]
    );

    // Record automated SMS log
    const smsId = `SMS-${Math.floor(100 + Math.random() * 900)}`;
    await dbRun(
      `INSERT INTO sms_logs (id, timestamp, recipientPhone, recipientName, role, message, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        smsId,
        createdAt,
        data.patientPhone || '+91 98220 12345',
        data.patientName,
        'patient',
        `AarogyaRakshak: Digital Referral ${id} generated to ${data.targetHospitalName || 'Secondary Facility'}. Present QR slip upon arrival.`,
        'Referral',
        'Delivered'
      ]
    );

    const created = await dbQuery('SELECT * FROM referrals WHERE id = ?', [id]);
    return res.status(201).json(created[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateReferralStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updatedAt = new Date().toISOString();

    await dbRun(
      'UPDATE referrals SET status = ?, updatedAt = ?, rejectionReason = ? WHERE id = ?',
      [status, updatedAt, notes || null, id]
    );

    return res.json({ success: true, id, status });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
