import { NextRequest } from 'next/server';
import { isFormClosed } from '@/lib/deadline';

export async function POST(req: NextRequest) {
  if (isFormClosed()) {
    return Response.json({ error: 'form_closed' }, { status: 403 });
  }

  const body = await req.json();
  const res = await fetch(process.env.APPS_SCRIPT_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data);
}
