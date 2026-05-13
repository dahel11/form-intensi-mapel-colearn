// MOCK — hapus ini dan ganti dengan versi asli setelah Apps Script siap
export async function POST() {
  await new Promise(r => setTimeout(r, 800)); // simulasi loading
  return Response.json({ success: true });
}
