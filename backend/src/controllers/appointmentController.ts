import { Request, Response } from 'express';
import { dbQuery, dbRun } from '../config/db.js';

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const rows = await dbQuery('SELECT * FROM appointments ORDER BY createdAt DESC');
    const formatted = rows.map((a: any) => ({
      ...a,
      statusHistory: JSON.parse(a.statusHistory || '[]'),
      prescription: a.prescription ? JSON.parse(a.prescription) : undefined,
      isEmergencyAlert: Boolean(a.isEmergencyAlert),
      isEConsultation: Boolean(a.isEConsultation)
    }));
    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const id = data.id || `APT-MH-${Math.floor(1000 + Math.random() * 9000)}`;
    const tokenNumber = data.tokenNumber || `MH-TK-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = new Date().toISOString();
    const qrCodeData = `MH-TOKEN-${data.patientId || 'PT'}-${id}`;

    await dbRun(
      `INSERT INTO appointments (id, tokenNumber, patientId, patientName, patientAge, patientGender, patientPhone, hospitalId, hospitalName, hospitalType, department, doctorId, doctorName, date, timeSlot, chiefComplaint, suggestedDepartmentByNLP, isEmergencyAlert, assistedByAshaId, assistedByAshaName, status, statusHistory, queuePosition, estimatedWaitMins, qrCodeData, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        tokenNumber,
        data.patientId || 'PT-MH-9021',
        data.patientName || 'Citizen',
        data.patientAge || 30,
        data.patientGender || 'Male',
        data.patientPhone || '+91 98220 12345',
        data.hospitalId || 'HOSP-PHC-MOR',
        data.hospitalName || 'Primary Health Centre (PHC) Morgaon',
        data.hospitalType || 'PHC',
        data.department || 'General Medicine',
        data.doctorId || 'DOC-MH-101',
        data.doctorName || 'Dr. Aniruddha Kulkarni',
        data.date || new Date().toISOString().split('T')[0],
        data.timeSlot || '10:00 AM',
        data.chiefComplaint || 'Routine checkup',
        data.suggestedDepartmentByNLP || 'General Medicine',
        data.isEmergencyAlert ? 1 : 0,
        data.assistedByAshaId || null,
        data.assistedByAshaName || null,
        data.status || 'CONFIRMED',
        JSON.stringify(data.statusHistory || [{ stage: 'CONFIRMED', timestamp: createdAt, updatedBy: 'System', role: 'patient', hospitalName: data.hospitalName || 'PHC Morgaon' }]),
        data.queuePosition || 1,
        data.estimatedWaitMins || 15,
        qrCodeData,
        createdAt
      ]
    );

    const created = await dbQuery('SELECT * FROM appointments WHERE id = ?', [id]);
    return res.status(201).json({
      ...created[0],
      statusHistory: JSON.parse(created[0].statusHistory || '[]'),
      isEmergencyAlert: Boolean(created[0].isEmergencyAlert)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, updatedBy, role, notes, cancellationReason } = req.body;

    const rows = await dbQuery('SELECT * FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

    const apt = rows[0];
    const history = JSON.parse(apt.statusHistory || '[]');
    history.push({
      stage: status,
      timestamp: new Date().toISOString(),
      updatedBy: updatedBy || 'Medical Staff',
      role: role || 'staff',
      hospitalName: apt.hospitalName,
      notes
    });

    await dbRun(
      'UPDATE appointments SET status = ?, statusHistory = ?, cancellationReason = ? WHERE id = ?',
      [status, JSON.stringify(history), cancellationReason || apt.cancellationReason, id]
    );

    return res.json({ success: true, id, status });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const completeConsultation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { prescription, doctorName } = req.body;

    const rows = await dbQuery('SELECT * FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

    const apt = rows[0];
    const history = JSON.parse(apt.statusHistory || '[]');
    history.push({
      stage: 'COMPLETED',
      timestamp: new Date().toISOString(),
      updatedBy: doctorName || apt.doctorName,
      role: 'doctor',
      hospitalName: apt.hospitalName,
      notes: 'Consultation completed & digital prescription signed.'
    });

    await dbRun(
      'UPDATE appointments SET status = ?, prescription = ?, statusHistory = ? WHERE id = ?',
      ['COMPLETED', JSON.stringify(prescription), JSON.stringify(history), id]
    );

    // Record automated SMS log
    const smsId = `SMS-${Math.floor(100 + Math.random() * 900)}`;
    await dbRun(
      `INSERT INTO sms_logs (id, timestamp, recipientPhone, recipientName, role, message, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        smsId,
        new Date().toISOString(),
        apt.patientPhone,
        apt.patientName,
        'patient',
        `AarogyaRakshak: Digital Prescription #${prescription.id || 'RX-MH-101'} signed by ${doctorName || apt.doctorName}. Open details in Patient Portal.`,
        'Prescription',
        'Delivered'
      ]
    );

    return res.json({ success: true, appointmentId: id, prescription });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
