import { z } from "zod";
import prisma from "../../../../prisma/client";

const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().min(1, "Description is required"),
});

export async function POST(req) {
  try {
    const body = await req.json(req);
    const validation = createIssueSchema.safeParse(body);
    if (!validation.success) {
      return new Response(validation.error.format(), { status: 400 });
    }
    const newIssue = await prisma.issue.create({
      data: {
        title: body.title,
        description: body.description,
        name: body.name,
      },
    });

    return Response.json(newIssue, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const issues = await prisma.issue.findMany();
    return Response.json({ data: issues, status: true }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


