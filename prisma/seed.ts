import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = 'Password123!';
  const hashed = await hash(password, 10);

  const [manager, user] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'manager@example.com' },
      update: {},
      create: { email: 'manager@example.com', name: 'Manager', role: 'MANAGER', hashedPassword: hashed },
    }),
    prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: { email: 'user@example.com', name: 'User', role: 'USER', hashedPassword: hashed },
    }),
  ]);

  await prisma.workOrder.createMany({
    data: [
      { title: 'Leaking tap', description: 'Room 101', priority: 'MED', status: 'OPEN', createdById: user.id, assignedToId: manager.id },
      { title: 'Broken light', description: 'Hallway', priority: 'LOW', status: 'IN_PROGRESS', createdById: manager.id, assignedToId: manager.id },
      { title: 'Clogged drain', description: 'Kitchen', priority: 'HIGH', status: 'OPEN', createdById: user.id, assignedToId: manager.id },
      { title: 'Flickering AC', description: 'Conference Room', priority: 'MED', status: 'IN_PROGRESS', createdById: manager.id, assignedToId: manager.id },
      { title: 'Door hinge repair', description: 'Room 202', priority: 'LOW', status: 'DONE', createdById: user.id, assignedToId: manager.id },
      { title: 'Window broken', description: 'Lobby', priority: 'HIGH', status: 'OPEN', createdById: user.id, assignedToId: manager.id },
      { title: 'Light switch malfunction', description: 'Room 303', priority: 'MED', status: 'OPEN', createdById: manager.id, assignedToId: manager.id },
      { title: 'Leaky roof', description: 'Top floor', priority: 'HIGH', status: 'IN_PROGRESS', createdById: user.id, assignedToId: manager.id },
      { title: 'Heating issue', description: 'Room 101', priority: 'MED', status: 'OPEN', createdById: manager.id, assignedToId: manager.id },
      { title: 'Paint peeling', description: 'Hallway', priority: 'LOW', status: 'DONE', createdById: user.id, assignedToId: manager.id },
      { title: 'Broken chair', description: 'Room 105', priority: 'LOW', status: 'OPEN', createdById: user.id, assignedToId: manager.id },
      { title: 'Air vent cleaning', description: 'Office 2', priority: 'MED', status: 'IN_PROGRESS', createdById: manager.id, assignedToId: manager.id },
      { title: 'Water cooler repair', description: 'Pantry', priority: 'HIGH', status: 'OPEN', createdById: user.id, assignedToId: manager.id },
      { title: 'Ceiling fan issue', description: 'Room 106', priority: 'MED', status: 'DONE', createdById: manager.id, assignedToId: manager.id },
      { title: 'Smoke detector test', description: 'Lobby', priority: 'LOW', status: 'OPEN', createdById: user.id, assignedToId: manager.id },
      { title: 'Window blinds stuck', description: 'Room 204', priority: 'MED', status: 'IN_PROGRESS', createdById: manager.id, assignedToId: manager.id },
      { title: 'Carpet stain', description: 'Conference Room', priority: 'LOW', status: 'DONE', createdById: user.id, assignedToId: manager.id },
      { title: 'Light fixture replacement', description: 'Hallway', priority: 'HIGH', status: 'OPEN', createdById: user.id, assignedToId: manager.id },
      { title: 'Door lock repair', description: 'Room 303', priority: 'MED', status: 'OPEN', createdById: manager.id, assignedToId: manager.id },
      { title: 'AC filter change', description: 'Office 3', priority: 'LOW', status: 'IN_PROGRESS', createdById: user.id, assignedToId: manager.id },

    ]
  });

  console.log('Seed complete: test users + sample orders');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
