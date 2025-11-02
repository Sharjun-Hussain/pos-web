import { BranchForm } from "@/components/branches/new/branches-form";

export default function AddBranchPage() {
  return (
    <div className="px-6 pb-6 pt-3">
      <div className="flex items-center justify-between space-y-2 mb-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Branch</h2>
          <p className="text-muted-foreground">
            Fill in the details below to add a new branch to your application.
          </p>
        </div>
      </div>
      <BranchForm />
    </div>
  );
}

export const metadata = {
  title: "Add New Branch | EMI-POS",
  description: "Developed By : Inzeedo (PVT) Ltd.",
};
