import { Request, Response } from 'express';
import { dbQuery, dbRun } from '../config/db.js';

export const getHospitals = async (req: Request, res: Response) => {
  try {
    const rows = await dbQuery('SELECT * FROM hospitals');
    const formatted = rows.map((h: any) => ({
      ...h,
      departments: JSON.parse(h.departments || '[]'),
      diagnostics: JSON.parse(h.diagnostics || '{}')
    }));
    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateBeds = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { availableBeds, occupiedBeds, icuBedsAvailable, oxygenBedsAvailable } = req.body;

    await dbRun(
      'UPDATE hospitals SET availableBeds = ?, occupiedBeds = ?, icuBedsAvailable = ?, oxygenBedsAvailable = ? WHERE id = ?',
      [availableBeds, occupiedBeds, icuBedsAvailable, oxygenBedsAvailable, id]
    );

    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
