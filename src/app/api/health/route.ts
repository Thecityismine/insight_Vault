export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ version: "v4", ok: true });
}
