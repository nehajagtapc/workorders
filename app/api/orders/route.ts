// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { z } from "zod";

// const orderSchema = z.object({
//   title: z.string().min(3),
//   description: z.string().min(3),
//   priority: z.enum(["LOW", "MED", "HIGH"]),
// });

// // Create new order
// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json();
//   const parsed = orderSchema.safeParse(body);
//   if (!parsed.success) {
//     return NextResponse.json(parsed.error.format(), { status: 400 });
//   }

//   const order = await prisma.workOrder.create({
//     data: {
//       ...parsed.data,
//       status: "OPEN",
//       createdById: session.user.id,
//     },
//   });

//   return NextResponse.json(order, { status: 201 });
// }

// // Fetch all orders
// export async function GET() {
//   const orders = await prisma.workOrder.findMany({
//     orderBy: { createdAt: "desc" },
//   });
//   return NextResponse.json(orders);
// }
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const orderSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  priority: z.enum(["LOW", "MED", "HIGH"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]).optional(),
  assignedTo: z.object({ email: z.string().email() }).optional(),
});

// PATCH /api/orders/[id] — Update order
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  const order = await prisma.workOrder.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
    },
  });

  return NextResponse.json(order);
}

// GET /api/orders/[id] — Fetch single order
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.workOrder.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { email: true } },
      createdBy: { select: { email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
