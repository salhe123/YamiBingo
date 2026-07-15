import WalletsTable from "@/components/SuperAdmins/WalletsTable";
import WalletsTopUp from "@/components/SuperAdmins/WalletsTopUp";
import React from "react";

const page = () => {
  return (
    <div className="mx-auto px-1 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* <div className=" shadow-md shadow-black rounded-lg lg:col-span-3 lg:order-none">
          <WalletsTopUp />
        </div> */}

        <div className=" shadow-md shadow-black rounded-lg lg:col-span-9 lg:order-none">
          <WalletsTable />
        </div>
      </div>
    </div>
  );
};

export default page;
