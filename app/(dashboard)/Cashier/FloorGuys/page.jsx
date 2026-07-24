"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
};

export default function CashierFloorGuysPage() {
  const { data: session, status } = useSession();
  const [floorGuys, setFloorGuys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null); // floorGuy row being edited

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/cashier/floor-guys");
      setFloorGuys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.message || "Failed to load FloorGuys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status, load]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const startEdit = (fg) => {
    setEditing(fg);
    setForm({
      firstName: fg.user?.firstName || "",
      lastName: fg.user?.lastName || "",
      email: fg.user?.email || "",
      phoneNumber: fg.user?.phoneNumber || "",
      password: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.patch(`/api/cashier/floor-guys/${editing.id}`, {
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
          ...(form.password ? { password: form.password } : {}),
        });
        toast("FloorGuy updated");
      } else {
        if (!form.password) {
          toast("Password is required for new FloorGuy");
          setSaving(false);
          return;
        }
        await axios.post("/api/cashier/floor-guys", form);
        toast("FloorGuy registered for your shop");
      }
      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fg) => {
    const name = `${fg.user?.firstName || ""} ${fg.user?.lastName || ""}`.trim();
    if (
      !window.confirm(
        `Delete FloorGuy "${name || fg.user?.email}"? They will no longer be able to log in.`,
      )
    ) {
      return;
    }
    try {
      await axios.delete(`/api/cashier/floor-guys/${fg.id}`);
      toast("FloorGuy deleted");
      if (editing?.id === fg.id) resetForm();
      await load();
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.message || "Delete failed");
    }
  };

  const toggleBlock = async (fg) => {
    try {
      const next = !(fg.isBlocked || fg.user?.isBlocked);
      await axios.patch(`/api/cashier/floor-guys/${fg.id}`, {
        isBlocked: next,
      });
      toast(next ? "FloorGuy blocked" : "FloorGuy unblocked");
      await load();
    } catch (err) {
      toast(err.response?.data?.message || "Update failed");
    }
  };

  if (status === "loading") {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Floor Guys</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage FloorGuys for your shop only
          {session?.user?.shopName ? (
            <>
              : <span className="font-semibold text-orange-600">{session.user.shopName}</span>
            </>
          ) : null}
          . They can select cards that sync to your Bingo Game screen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-4 bg-white shadow rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit FloorGuy" : "Register FloorGuy"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">First name</label>
              <input
                name="firstName"
                required
                value={form.firstName}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Last name</label>
              <input
                name="lastName"
                required
                value={form.lastName}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                required
                disabled={!!editing}
                value={form.email}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Phone</label>
              <input
                name="phoneNumber"
                required
                value={form.phoneNumber}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">
                Password {editing ? "(leave blank to keep)" : ""}
              </label>
              <input
                name="password"
                type="password"
                required={!editing}
                value={form.password}
                onChange={onChange}
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Update" : "Register"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border px-4 py-2 rounded text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-8 bg-white shadow rounded-lg p-5 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">
            Your FloorGuys ({floorGuys.length})
          </h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : floorGuys.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No FloorGuys yet. Register one for this shop.
            </p>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {floorGuys.map((fg) => {
                  const blocked = fg.isBlocked || fg.user?.isBlocked;
                  return (
                    <tr key={fg.id} className="border-b">
                      <td className="px-3 py-2">
                        {fg.user?.firstName} {fg.user?.lastName}
                      </td>
                      <td className="px-3 py-2">{fg.user?.email}</td>
                      <td className="px-3 py-2">{fg.user?.phoneNumber || "—"}</td>
                      <td className="px-3 py-2">
                        {blocked ? (
                          <span className="text-red-600">Blocked</span>
                        ) : (
                          <span className="text-emerald-600">Active</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(fg)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBlock(fg)}
                            className="text-amber-600 hover:underline"
                          >
                            {blocked ? "Unblock" : "Block"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(fg)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
