import { getLibraryCourses } from "@family-support/data";

export async function GET() {
  return Response.json(getLibraryCourses());
}
