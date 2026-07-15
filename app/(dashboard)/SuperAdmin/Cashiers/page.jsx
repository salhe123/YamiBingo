import CashierAssign from "@/components/SuperAdmins/CashierAssign";
import CashierTable from "@/components/SuperAdmins/CashierTable";
import React from "react";

const Cashier = () => {
  return (
    <div className="mx-auto px-2 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* <div className="bg-white shadow-md rounded-lg lg:col-span-3 lg:order-none">
          <CashierAssign />
        </div> */}

        <div className="bg-white shadow-md rounded-lg p-6 lg:p-8 lg:col-span-9 order-2 lg:order-none">
          <CashierTable />
        </div>
      </div>
    </div>
  );
};

export default Cashier;
