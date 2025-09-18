
# workorders
A role-based work order management system built with Next.js 14, Prisma, and NextAuth. A Next.js + Prisma project to manage work orders with authentication, filters, pagination, and role-based access.

<img width="1893" height="922" alt="Screenshot 2025-09-18 034247" src="https://github.com/user-attachments/assets/3351ec8e-ab78-4b59-87f6-79a3c87482b2" />
<img width="1897" height="996" alt="Screenshot 2025-09-18 033730" src="https://github.com/user-attachments/assets/d577a78c-8f99-4e2c-8d45-e9e723bd69ce" />
<img width="1906" height="1006" alt="Screenshot 2025-09-18 034326" src="https://github.com/user-attachments/assets/0542057a-efdc-4c6d-a9cd-50bd533c9563" />

# Tech Stack

Next.js 14 (App Router, Server Actions)
Prisma ORM (SQLite/Postgres/MySQL)
NextAuth (JWT Sessions, Credentials Provider)
TypeScript
TailwindCSS (for minimal UI)

# Installation of this project
1. Clone the repository:
```
git clone https://github.com/nehajagtapc/workorders.git
```
This creates a new folder called workorders.

2. Navigate to that directory:
```
cd workorders
```

3. Installation:
```
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm approve-builds
pnpm prisma generate
pnpm dev
```

4. Environment Variables:
```
# Database connection
DATABASE_URL="file:./prisma/dev.db"

# NextAuth secret
NEXTAUTH_SECRET="aXJ0z3k9pQ7mW8vL2nB4fY6hT1rK5jN8xC0wM2qP9s="

# NextAuth URL
NEXTAUTH_URL="http://localhost:3000"
```

5. Prisma Setup & DB Connection:
```
# Generate Prisma client
pnpm exec prisma generate

# Optional: Add cross-env if needed for scripts
pnpm add -D cross-env

# Push schema to DB
pnpm exec prisma db push

# Open Prisma Studio to inspect DB
pnpm exec prisma studio
```
Prisma Studio opens at http://localhost:5555
so you can verify tables (User, WorkOrder, etc.)


<img width="1163" height="127" alt="Screenshot 2025-09-18 034002" src="https://github.com/user-attachments/assets/90d1d6ef-4ac1-4ea5-9d52-a712df8535a2" />
<img width="1897" height="996" alt="Screenshot 2025-09-18 033730" src="https://github.com/user-attachments/assets/5145b20a-b408-41a7-8873-a7c05d5cda56" />
<img width="1910" height="981" alt="Screenshot 2025-09-18 033835" src="https://github.com/user-attachments/assets/81b7f4c9-6019-4ea7-aea8-358d2379279b" />
<img width="1888" height="1002" alt="Screenshot 2025-09-18 033924" src="https://github.com/user-attachments/assets/816db409-b121-464e-abe4-40e44ac32405" />

# Login access:
User access:
email : user@example.com
password: Password123!

Manager access to all:
email : manager@example.com
password: Password123!

# User login:
<img width="1906" height="1006" alt="Screenshot 2025-09-18 034326" src="https://github.com/user-attachments/assets/17c67ba5-c1b1-498c-8cb2-1841b3fabfe3" />

# Manager login:
<img width="1876" height="941" alt="Screenshot 2025-09-18 034425-manager" src="https://github.com/user-attachments/assets/abae64e9-c6ad-4853-8bd1-db8559025635" />

<img width="1860" height="803" alt="Screenshot 2025-09-18 034512" src="https://github.com/user-attachments/assets/eabb7a14-2a8a-45e7-a752-5a4fc9e9f584" />

# Prisma Schema Example:
```
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String      @id @default(cuid())
  name      String
  email     String      @unique
  password  String
  role      Role        @default(USER)
  orders    WorkOrder[] @relation("CreatedOrders")
  assigned  WorkOrder[] @relation("AssignedOrders")
}

model WorkOrder {
  id          String   @id @default(cuid())
  title       String
  description String
  priority    Priority
  status      Status   @default(OPEN)
  createdBy   User     @relation("CreatedOrders", fields: [createdById], references: [id])
  createdById String
  assignedTo  User?    @relation("AssignedOrders", fields: [assignedToId], references: [id])
  assignedToId String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  USER
  MANAGER
}

enum Status {
  OPEN
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MED
  HIGH
}
```
# Authorization

All reads/writes are enforced on the server (never rely on client-side checks).
Access rules applied to /orders/new and /orders/id routes.

# Orders Routes & Authorization:
1. /orders/new (Create Order)
2. /orders/id (Edit/View Order)

# Orders List with Search/Filter:
app/orders/page.tsx uses query parameters:
```
const where: any = session.user.role === "USER" ? { createdById: session.user.id } : {};
if (search) where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
if (statusFilter) where.status = statusFilter;
if (priorityFilter) where.priority = priorityFilter;

```

  http://localhost:3000/orders → List with search/filter
  http://localhost:3000/orders/new → Create order
  http://localhost:3000/orders/id → Edit order

# Core Features:

1. Orders List – Paginated list of work orders with text search, filters (status, priority), and role-based scoping.
2. Create Order – Users can submit new work orders via a form (server-side validation with Zod).
3. Order Detail – View full details of a single order.
4. Role-based Access –
  User → Can only see their own orders.
  Manager → Can see all orders.

## Author  
**Neha Jagtap**
