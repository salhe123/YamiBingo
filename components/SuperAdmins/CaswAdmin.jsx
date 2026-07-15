"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CaswAdmin = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [cashier, setCashier] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [shop, setShop] = useState({ shopName: "", location: "" });
  const [walletAmount, setWalletAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;
    const nameRegex = /^[A-Za-z]{2,10}$/;

    if (!nameRegex.test(admin.firstName))
      errors.adminFirstName = "First name must be 2-10 letters only";
    if (!nameRegex.test(admin.lastName))
      errors.adminLastName = "Last name must be 2-10 letters only";
    if (!emailRegex.test(admin.email))
      errors.adminEmail = "Invalid email format";
    if (!phoneRegex.test(admin.phoneNumber))
      errors.adminPhoneNumber = "Phone must be 10-15 digits";
    if (admin.password.length < 4)
      errors.adminPassword = "Password must be at least 4 characters";

    if (!nameRegex.test(cashier.firstName))
      errors.cashierFirstName = "First name must be 2-10 letters only";
    if (!nameRegex.test(cashier.lastName))
      errors.cashierLastName = "Last name must be 2-10 letters only";
    if (!emailRegex.test(cashier.email))
      errors.cashierEmail = "Invalid email format";
    if (!phoneRegex.test(cashier.phoneNumber))
      errors.cashierPhoneNumber = "Phone must be 10-15 digits";
    if (cashier.password.length < 4)
      errors.cashierPassword = "Password must be at least 4 characters";

    if (!nameRegex.test(shop.shopName))
      errors.shopName = "Shop name must be 2-10 letters only";
    if (!shop.location.trim()) errors.location = "Location is required";
    if (walletAmount < 0) errors.walletAmount = "Amount cannot be negative";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setAdmin({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    });
    setCashier({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    });
    setShop({ shopName: "", location: "" });
    setWalletAmount(1000);
    setSuccess(false);
    setError("");
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const agentId = session?.user?.id;
      if (!agentId) throw new Error("Agent not authenticated");

      const adminResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...admin, role: "Admin", agentId }),
      });
      if (!adminResponse.ok) {
        const errorData = await adminResponse.json();
        throw new Error(
          errorData?.message ||
            `Failed to create Admin: Status ${adminResponse.status}`
        );
      }
      const adminData = await adminResponse.json();

      const cashierResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cashier, role: "Cashier", agentId }),
      });
      if (!cashierResponse.ok) {
        const errorData = await cashierResponse.json();
        throw new Error(
          errorData?.message ||
            `Failed to create Cashier: Status ${cashierResponse.status}`
        );
      }
      const cashierData = await cashierResponse.json();

      if (!adminData?.user?.id) throw new Error("Admin ID is missing");

      const shopResponse = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: shop.shopName,
          location: shop.location,
          ownerId: adminData.user.id,
          agentId,
        }),
      });
      if (!shopResponse.ok) {
        const errorData = await shopResponse.json();
        throw new Error(
          errorData?.message ||
            `Failed to create Shop: Status ${shopResponse.status}`
        );
      }
      const shopData = await shopResponse.json();

      const cashierShopResponse = await fetch("/api/cashiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: shopData.id,
          userId: cashierData.user.id,
          agentId,
        }),
      });
      if (!cashierShopResponse.ok) {
        const errorData = await cashierShopResponse.json();
        throw new Error(
          errorData?.message ||
            `Failed to assign Cashier: Status ${cashierShopResponse.status}`
        );
      }

      const walletResponse = await fetch("/api/agent-wallets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: shopData.id,
          adminId: adminData.user.id,
          initialBalance: walletAmount,
          agentId, // Include agentId for deduction
        }),
      });
      if (!walletResponse.ok) {
        const errorData = await walletResponse.json();
        throw new Error(
          errorData?.message ||
            `Failed to create Wallet: Status ${walletResponse.status}`
        );
      }

      setSuccess(true);
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message || "An error occurred during registration.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = () => {
    if (validateForm()) setShowModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto overflow-y-auto rounded-lg shadow-lg shadow-gray-700/50 p-6 m-6 font-sans text-gray-50 bg-gray-800">
      <h2 className="text-2xl font-bold text-orange-400 text-center pb-4 border-b border-gray-600">
        Register New Shop
      </h2>
      {success && (
        <div className="text-green-500 text-sm text-center mb-4">
          Shop registered successfully! Redirecting to Users...
        </div>
      )}
      {error && (
        <div className="text-red-500 text-sm text-center mb-4">{error}</div>
      )}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6 mt-4">
        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            Admin Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={admin.firstName}
                onChange={(e) => handleInputChange(e, setAdmin)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.adminFirstName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.adminFirstName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.adminFirstName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={admin.lastName}
                onChange={(e) => handleInputChange(e, setAdmin)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.adminLastName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.adminLastName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.adminLastName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={admin.email}
                onChange={(e) => handleInputChange(e, setAdmin)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.adminEmail ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.adminEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.adminEmail}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={admin.phoneNumber}
                onChange={(e) => handleInputChange(e, setAdmin)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.adminPhoneNumber ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.adminPhoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.adminPhoneNumber}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={admin.password}
                onChange={(e) => handleInputChange(e, setAdmin)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.adminPassword ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.adminPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.adminPassword}
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            Cashier Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={cashier.firstName}
                onChange={(e) => handleInputChange(e, setCashier)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.cashierFirstName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.cashierFirstName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.cashierFirstName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={cashier.lastName}
                onChange={(e) => handleInputChange(e, setCashier)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.cashierLastName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.cashierLastName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.cashierLastName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={cashier.email}
                onChange={(e) => handleInputChange(e, setCashier)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.cashierEmail ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.cashierEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.cashierEmail}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={cashier.phoneNumber}
                onChange={(e) => handleInputChange(e, setCashier)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.cashierPhoneNumber ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.cashierPhoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.cashierPhoneNumber}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={cashier.password}
                onChange={(e) => handleInputChange(e, setCashier)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.cashierPassword ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.cashierPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.cashierPassword}
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            Shop Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Shop Name
              </label>
              <input
                type="text"
                name="shopName"
                placeholder="Shop Name"
                value={shop.shopName}
                onChange={(e) => handleInputChange(e, setShop)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.shopName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.shopName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.shopName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={shop.location}
                onChange={(e) => handleInputChange(e, setShop)}
                className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full transition-colors duration-200 ${
                  validationErrors.location ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.location && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.location}
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">
            Wallet Details
          </h3>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Initial Wallet Amount
            </label>
            <input
              type="number"
              name="walletAmount"
              placeholder="Initial Wallet Amount"
              value={walletAmount}
              onChange={(e) => setWalletAmount(Number(e.target.value))}
              className={`p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg w-full focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors duration-200 ${
                validationErrors.walletAmount ? "border-red-500" : ""
              }`}
              required
            />
            {validationErrors.walletAmount && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.walletAmount}
              </p>
            )}
          </div>
        </section>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleModalSubmit}
            className="py-2 px-6 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? <span className="animate-spin mr-2">🔄</span> : null}
            Preview and Submit
          </button>
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-orange-400 mb-4">
              Preview Submitted Data
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-200">Admin Details:</h4>
                <p>
                  {admin.firstName} {admin.lastName}
                </p>
                <p>Email: {admin.email}</p>
                <p>Phone: {admin.phoneNumber}</p>
                <p>Password: {admin.password}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-200">
                  Cashier Details:
                </h4>
                <p>
                  {cashier.firstName} {cashier.lastName}
                </p>
                <p>Email: {cashier.email}</p>
                <p>Phone: {cashier.phoneNumber}</p>
                <p>Password: {cashier.password}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-200">Shop Details:</h4>
                <p>Name: {shop.shopName}</p>
                <p>Location: {shop.location}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-200">Wallet Details:</h4>
                <p>Initial Balance: {walletAmount} ETB</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={loading}
              >
                {loading ? <span className="animate-spin mr-2">🔄</span> : null}
                Confirm
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaswAdmin;