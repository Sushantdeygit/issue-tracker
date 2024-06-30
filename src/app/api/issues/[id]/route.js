import prisma from "../../../../../prisma/client";
import { z } from "zod";

const updateIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
});
export async function DELETE(req, { params }) {
  console.log(params);
  try {
    const id = params.id;
    const response = await prisma.issue.delete({
      where: {
        id: parseInt(id),
      },
    });
    if (!response) {
      return new Response("No issue found with that ID", { status: 404 });
    }
    return new Response("Deleted Successfully", { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();
    console.log(data);
    const updatedResource = await prisma.issue.update({
      where: { id: parseInt(id) },
      data: data,
    });
    const validation = updateIssueSchema.safeParse(data);
    if (!validation.success) {
      return new Response(validation.error.format(), { status: 400 });
    }
    return Response.json(
      { message: "Issue updated successfully!", data: updatedResource },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating resource:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
