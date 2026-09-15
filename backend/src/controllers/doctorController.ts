import { Request, Response } from 'express';
import { dbQuery } from '../config/db.js';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const rows = await dbQuery('SELECT * FROM doctors');
    const formatted = rows.map((d: any) => ({
      ...d,
      availableDays: JSON.parse(d.availableDays || '[]'),
      slots: JSON.parse(d.slots || '[]')
    }));
    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
