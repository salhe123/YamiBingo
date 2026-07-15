import ShopList from "@/components/Admins/ShopList";
import React from "react";

const page = () => {
  return (
    <div className="container mx-auto px-2">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <ShopList />
        </div>
      </div>
    </div>
  );
};

export default page;
