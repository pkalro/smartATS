import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { BulkUploadForm } from "./bulk-upload-form";

export default async function BulkUploadPage() {
  const session = await auth();
  const jobs = await prisma.job.findMany({
    where: { userId: session!.user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bulk upload resumes</h1>
        <p className="text-muted-foreground">
          Upload up to 25 resumes at once. AI screens each one and adds them to your candidates list.
        </p>
      </div>
      <BulkUploadForm jobs={jobs} />
    </div>
  );
}
