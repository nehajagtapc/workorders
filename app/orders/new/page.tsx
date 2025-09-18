"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

const orderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  priority: z.enum(["LOW", "MED", "HIGH"]).default("MED"),
});

export default function CreateOrderPage() {
  const [form, setForm] = useState({ title: "", description: "", priority: "MED" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  const parse = orderSchema.safeParse(form);

  try {
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parse.data),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create order");
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
      <h1 className="text-xl font-semibold mb-4">Create Order</h1>
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
        <button type="submit" className="btn">
          Create Order
        </button>
      </form>
    </div>
  );
}
