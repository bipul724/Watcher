// watcher/app/api/jobs/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, status, result, error } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: status?.toLowerCase() || "completed",
        result: result ? result : undefined,
        error: error ? String(error) : undefined,
      },
    });

    console.log("Job updated successfully:", jobId, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error updating job:", err);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}