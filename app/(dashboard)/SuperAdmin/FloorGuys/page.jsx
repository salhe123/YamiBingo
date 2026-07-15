import FloorGuyAssign from "@/components/SuperAdmins/FloorGuyAssign";
import FloorGuyTable from "@/components/SuperAdmins/FloorGuyTable";

export default function FloorGuysPage() {
  return (
    <div className="mx-auto px-2 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <FloorGuyAssign />
        </div>
        <div className="bg-gray-900 shadow-md rounded-lg p-6 lg:col-span-8">
          <FloorGuyTable />
        </div>
      </div>
    </div>
  );
}
