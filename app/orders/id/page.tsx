"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

const orderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  priority: z.enum(["LOW", "MED", "HIGH"]).default("MED"),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]).optional(),
  assignedTo: z.object({ email: z.string().email() }).optional(),
});

interface Props {
  params: { id: string };
  userRole: "USER" | "MANAGER";
}

export default function EditOrderPage({ params, userRole }: Props) {
  const { id } = params;
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MED",
    status: "OPEN",
    assignedTo: { email: "" },
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setForm({
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          assignedTo: data.assignedTo || { email: "" },
        });
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchOrder();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "assignedTo") {
      setForm(prev => ({ ...prev, assignedTo: { email: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parse = orderSchema.safeParse(form);
    if (!parse.success) {
      setError(Object.values(parse.error.format()).map((err: any) => err?._errors?.join(", ")).join(", "));
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parse.data),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update order");
        return;
      }

      router.push("/orders");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto mt-6 p-4">
      <h1 className="text-xl font-semibold mb-4">Edit Order</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="input"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="input"
          required
        />
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="input"
        >
          <option value="LOW">LOW</option>
          <option value="MED">MED</option>
          <option value="HIGH">HIGH</option>
        </select>

        {userRole === "MANAGER" && (
          <>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
            <input
              name="assignedTo"
              placeholder="Assigned To (email)"
              value={form.assignedTo?.email || ""}
              onChange={handleChange}
              className="input"
            />
          </>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
