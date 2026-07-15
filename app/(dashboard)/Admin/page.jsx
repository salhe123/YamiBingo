"use client";
import CashierTable from "@/components/Admins/CashierTable";
import ShopsTable from "@/components/Admins/ShopList";
import { useSession } from "next-auth/react";

const AdminDashboard = () => {
  const { data: session, status } = useSession();

  // Handle loading and unauthenticated states
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>You are not authenticated. Please log in.</div>;
  }

  // Function to render session data

  return (
    <div className="container mx-auto px-2">
      <div className="grid grid-cols-1 lg:grid-cols gap-4">
        {/* Left column: Session info */}
        <div className="container flex flex-col lg:flex-row gap-4 justify-center">
          <div className="p-6 text-center rounded-lg shadow-orange-500 shadow-lg bg-white">
            <h5 className="text-gray-900 text-xl font-medium mb-2">
              Hello there
            </h5>
            <h5 className="text-2xl text-orange-600">{session?.user?.email}</h5>
          </div>
        </div>

        {/* Right column: CashierTable and ShopsTable */}
        <div className="flex flex-col w-full justify-center lg:container">
          <div className="">
            <CashierTable />
          </div>
          <div className="">
            <ShopsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
