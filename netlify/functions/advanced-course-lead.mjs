// Receives registrations from the advanced course landing page and creates
// a lead in the Maayan Bashan CRM (Airtable), linked to that course cohort.
//
// Requires the AIRTABLE_TOKEN environment variable (Personal Access Token
// with data.records:write scope on the CRM base). Set via:
//   netlify env:set AIRTABLE_TOKEN <token>

const BASE_ID = 'appiziy69WzC5SqDK'; // Maayan Bashan CRM
const LEADS_TABLE_ID = 'tbl3s3NLLL75Siqg3'; // לידים פרטי

const FIELD_NAME = 'fldtIhXNTeKPPs41O'; // שם
const FIELD_STATUS = 'fld9Smx5O2HTn4zus'; // סטטוס
const FIELD_PHONE = 'fldIaXr31RLDOZgUh'; // Phone
const FIELD_EMAIL = 'fldCawUjSTnaDDO9j'; // Email
const FIELD_SOURCE = 'fldfCp8fztIeriZDZ'; // מקור הגעה
const FIELD_PLATFORM = 'fld8h8I2b5TaaPEKA'; // Platform
const FIELD_PRODUCTS = 'fldy6DhZezw4gVZuq'; // מוצרים (linked records)

// קורס שפת גוף מתקדמים ינואר 2027 — for the next cohort, override with the
// ADVANCED_COURSE_RECORD_ID environment variable instead of editing this file.
const DEFAULT_COURSE_RECORD_ID = 'recqLb5JoZHMR2peH';

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

  const courseRecordId = process.env.ADVANCED_COURSE_RECORD_ID || DEFAULT_COURSE_RECORD_ID;

  // Dedupe guard: if this phone number already submitted in the last 10
  // minutes (double-click, double-tap, or a retried request), don't create
  // a second lead — just acknowledge success.
  const normalizedPhone = phone.replace(/\D/g, '');
  if (normalizedPhone) {
    const dedupeFormula = `AND(REGEX_REPLACE({Phone}, "[^0-9]", "") = "${normalizedPhone}", DATETIME_DIFF(NOW(), CREATED_TIME(), "minutes") < 10)`;
    const dedupeUrl = `https://api.airtable.com/v0/${BASE_ID}/${LEADS_TABLE_ID}?maxRecords=1&filterByFormula=${encodeURIComponent(dedupeFormula)}`;
    const dedupeResponse = await fetch(dedupeUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (dedupeResponse.ok) {
      const dedupeData = await dedupeResponse.json();
      if (dedupeData.records?.length > 0) {
        return Response.json({ ok: true, duplicate: true });
      }
    } else {
      console.error('Airtable dedupe check failed', dedupeResponse.status, await dedupeResponse.text());
      // Fall through and create the lead — a failed dedupe check should
      // never block a genuine registration.
    }
  }

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
              [FIELD_STATUS]: 'חדש',
              [FIELD_PHONE]: phone,
              [FIELD_EMAIL]: email,
              [FIELD_SOURCE]: 'דף נחיתה - קורס שפת גוף מתקדמים',
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

export const config = { path: '/api/advanced-course-lead' };
