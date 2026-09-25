import { Request, Response } from 'express';
import { dbQuery, dbRun } from '../config/db.js';

export const getSmsLogs = async (req: Request, res: Response) => {
  try {
    const rows = await dbQuery('SELECT * FROM sms_logs ORDER BY timestamp DESC');
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const dispatchSms = async (req: Request, res: Response) => {
  try {
    const { recipientPhone, recipientName, role, message, category } = req.body;
    if (!recipientPhone || !message) {
      return res.status(400).json({ error: 'recipientPhone and message are required fields' });
    }

    const id = `SMS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    await dbRun(
      `INSERT INTO sms_logs (id, timestamp, recipientPhone, recipientName, role, message, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, timestamp, recipientPhone, recipientName || 'Citizen', role || 'patient', message, category || 'Emergency', 'Delivered']
    );

    return res.status(201).json({ id, timestamp, recipientPhone, recipientName, role, message, category, status: 'Delivered' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
