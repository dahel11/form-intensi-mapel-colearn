import { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const res = await fetch(`${process.env.APPS_SCRIPT_URL}?token=${params.token}`);
  const data = await res.json();
  return Response.json(data);
}
