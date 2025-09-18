import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
  priority?: string;
}

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold">Not signed in</h1>
        <p className="mt-2">
          Please <Link className="underline" href="/login">sign in</Link>.
        </p>
      </div>
    );
  }

  const page = Number(searchParams.page || "0");
  const search = searchParams.search || "";
  const { status: statusFilter, priority: priorityFilter, search: searchText } = await searchParams;

  // Build query based on role, search, and filters
  const where: any = session.user.role === "USER" 
    ? { createdById: session.user.id }
    : {};

  if (search) {
    where.OR = [
      { title: { contains: search} },
      { description: { contains: search} },
    ];
  }
  if (statusFilter) where.status = statusFilter;
  if (priorityFilter) where.priority = priorityFilter;

  const [orders, totalCount] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page * 10,
      take: 10,
      include: { createdBy: true, assignedTo: true },
    }),
    prisma.workOrder.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-3">Orders</h1>
      <Link href="/orders/new" className="btn">+ New Order</Link>
      <Link href="/orders/id" className="btn">+ ID</Link>
{/* Search & Filters */}
<form method="GET" className="flex gap-2 mb-4">
  <input
    type="text"
    name="search"
    placeholder="Search orders..."
    defaultValue={searchParams.search || ""}
    className="input"
  />
  <select name="status" defaultValue={searchParams.status || ""} className="input">
    <option value="">All Status</option>
    <option value="OPEN">OPEN</option>
    <option value="IN_PROGRESS">IN_PROGRESS</option>
    <option value="DONE">DONE</option>
  </select>
  <select name="priority" defaultValue={searchParams.priority || ""} className="input">
    <option value="">All Priority</option>
    <option value="LOW">LOW</option>
    <option value="MED">MED</option>
    <option value="HIGH">HIGH</option>
  </select>
  <button type="submit" className="btn">
    Search
  </button>
</form>

      {orders.length === 0 ? (
        <p className="text-sm text-zinc-500">No orders found.</p>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {orders.map((o) => (
            <div key={o.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{o.title}</div>
                <div className="text-xs text-zinc-500">
                  Created by {o.createdBy?.email} · Assigned to {o.assignedTo?.email ?? "—"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge">{o.status.toLowerCase()}</span>
                <span className="badge">{o.priority.toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between mt-4">
          <Link
            className={`btn ${page === 0 ? "opacity-50 pointer-events-none" : ""}`}
            href={`?page=${page - 1}`}
          >
            Previous
          </Link>
          <span className="text-sm text-zinc-500">
            Page {page + 1} of {totalPages}
          </span>
          <Link
            className={`btn ${page + 1 >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
            href={`?page=${page + 1}`}
          >
            Next
          </Link>
        </div>
        
      )}
    </div>
    
  );
}
