import { z } from "zod";
import prisma from "../../../../prisma/client";

const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
});

export async function POST(req) {
  const body = await req.json(req);
  const validation = createIssueSchema.safeParse(body);
  if (!validation.success) {
    return new Response(validation.error.format(), { status: 400 });
  }
  const newIssue = await prisma.issue.create({
    data: { title: body.title, description: body.description },
  });

  return Response.json(newIssue, { status: 201 });
}
