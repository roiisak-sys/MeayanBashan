// Receives course registrations from the landing page and creates a lead
// in the Maayan Bashan CRM (Airtable), linked to the current course cohort.
//
// Requires the AIRTABLE_TOKEN environment variable (Personal Access Token
// with data.records:write scope on the CRM base). Set via:
//   netlify env:set AIRTABLE_TOKEN <token>

const BASE_ID = 'appiziy69WzC5SqDK'; // Maayan Bashan CRM
const LEADS_TABLE_ID = 'tbl3s3NLLL75Siqg3'; // לידים פרטי

const FIELD_NAME = 'fldtIhXNTeKPPs41O'; // שם
const FIELD_PHONE = 'fldIaXr31RLDOZgUh'; // Phone
const FIELD_EMAIL = 'fldCawUjSTnaDDO9j'; // Email
const FIELD_SOURCE = 'fldfCp8fztIeriZDZ'; // מקור הגעה
const FIELD_PLATFORM = 'fld8h8I2b5TaaPEKA'; // Platform
const FIELD_PRODUCTS = 'fldy6DhZezw4gVZuq'; // מוצרים (linked records)

// קורס שפת גוף אוקטובר 2026 — for the next cohort, override with the
// COURSE_RECORD_ID environment variable instead of editing this file.
const DEFAULT_COURSE_RECORD_ID = 'recjezzByzUmQ5VYo';

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const token = process.env.AIRTABLE_TOKEN;
  if (!token) {
    console.error('AIRTABLE_TOKEN is not configured');
    return Response.json({ ok: false, error: 'not configured' }, { status: 500 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const name = String(payload.name ?? '').trim();
  const email = String(payload.email ?? '').trim();
  const phone = String(payload.phone ?? '').trim();
  if (!name || !phone) {
    return Response.json({ ok: false, error: 'missing name or phone' }, { status: 400 });
  }

  const courseRecordId = process.env.COURSE_RECORD_ID || DEFAULT_COURSE_RECORD_ID;

  const airtableResponse = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${LEADS_TABLE_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              [FIELD_NAME]: name,
              [FIELD_PHONE]: phone,
              [FIELD_EMAIL]: email,
              [FIELD_SOURCE]: 'דף נחיתה - קורס שפת גוף',
              [FIELD_PLATFORM]: 'Website',
              [FIELD_PRODUCTS]: [courseRecordId],
            },
          },
        ],
        typecast: true,
      }),
    }
  );

  if (!airtableResponse.ok) {
    const detail = await airtableResponse.text();
    console.error('Airtable create failed', airtableResponse.status, detail);
    return Response.json({ ok: false, error: 'airtable error' }, { status: 502 });
  }

  return Response.json({ ok: true });
};

export const config = { path: '/api/course-lead' };
