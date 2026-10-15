import 'dotenv/config';
import { PrismaClient, Status } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting idempotent demo seeder...');

  // 1. Seed Demo Accounts
  const passwordAdmin = await bcrypt.hash('Admin@123', 12);
  const passwordOwner = await bcrypt.hash('Owner@123', 12);
  const passwordBuyer = await bcrypt.hash('Buyer@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@omnilist.local' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@omnilist.local',
      passwordHash: passwordAdmin,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin demo user ready: admin@omnilist.local (Admin@123)');

  const owner = await prisma.user.upsert({
    where: { email: 'owner@omnilist.local' },
    update: { role: 'OWNER' },
    create: {
      email: 'owner@omnilist.local',
      passwordHash: passwordOwner,
      role: 'OWNER',
    },
  });
  console.log('✅ Owner demo user ready: owner@omnilist.local (Owner@123)');

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@omnilist.local' },
    update: { role: 'USER' },
    create: {
      email: 'buyer@omnilist.local',
      passwordHash: passwordBuyer,
      role: 'USER',
    },
  });
  console.log('✅ Buyer demo user ready: buyer@omnilist.local (Buyer@123)');

  // 2. Seed Mock Properties if database is empty or owner has no properties
  const ownerPropertyCount = await prisma.property.count({
    where: { ownerId: owner.id, deletedAt: null },
  });

  if (ownerPropertyCount === 0) {
    console.log('Seeding portfolio properties for owner and admin...');

    const demoProperties = [
      // Owner Properties (gives Owner dashboard rich metrics across Published, Draft, Archived)
      {
        title: 'Modern Glass Villa with Ocean Views',
        description: 'Experience unparalleled luxury in this modern glass villa. Featuring 270-degree ocean views, an infinity pool, smart home automation, and imported Italian marble floors. Designed by award-winning architects, this space seamlessly blends indoor and outdoor living.',
        location: 'Beverly Hills, CA',
        price: 5450000,
        status: Status.PUBLISHED,
        publishedAt: new Date(),
        ownerId: owner.id,
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687930-cebc5a882aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687644-aac4c15ae279?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        title: 'Minimalist Urban Penthouse',
        description: 'High above the bustling city sits this tranquil minimalist penthouse. With its open floor plan, floor-to-ceiling windows, exposed concrete accents, and a massive private terrace, it is the ultimate retreat for the modern professional.',
        location: 'Downtown Manhattan, NY',
        price: 3200000,
        status: Status.PUBLISHED,
        publishedAt: new Date(),
        ownerId: owner.id,
        images: [
          'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        title: 'Contemporary Waterfront Villa (Pending Inspection)',
        description: 'Prime waterfront property currently undergoing final interior architectural finishing. Open plan living with panoramic sunset terrace, private jetty, and designer kitchen.',
        location: 'Miami Beach, FL',
        price: 4100000,
        status: Status.DRAFT,
        publishedAt: null,
        ownerId: owner.id,
        images: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        title: 'Historic Beacon Hill Townhouse',
        description: 'Classic brick townhouse featuring preserved 19th-century molding, four working fireplaces, private garden courtyard, and modern sub-zero kitchen appliances.',
        location: 'Boston, MA',
        price: 2650000,
        status: Status.ARCHIVED,
        publishedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        ownerId: owner.id,
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        ],
      },
      // Admin Properties
      {
        title: 'Cozy Alpine Cabin Retreat',
        description: 'Escape to the mountains in this newly renovated luxury cabin. Warm wood finishings, a massive stone fireplace, heated floors, and direct ski-in/ski-out access make this the perfect winter home or rental investment.',
        location: 'Aspen, CO',
        price: 1850000,
        status: Status.PUBLISHED,
        publishedAt: new Date(),
        ownerId: admin.id,
        images: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542314831-c6a4d14eccda?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        ],
      },
      {
        title: 'Lakeside Architectural Marvel',
        description: 'A striking geometric masterpiece sitting right on the lake edge. Built with sustainable materials and powered entirely by hidden solar panels. Features private dock access, a separate guest house, and an underground wine cellar.',
        location: 'Lake Tahoe, NV',
        price: 2900000,
        status: Status.PUBLISHED,
        publishedAt: new Date(),
        ownerId: admin.id,
        images: [
          'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        ],
      },
    ];

    const createdProps: Array<{ id: string; status: Status }> = [];
    for (const prop of demoProperties) {
      const created = await prisma.property.create({
        data: {
          title: prop.title,
          description: prop.description,
          location: prop.location,
          price: prop.price,
          status: prop.status,
          publishedAt: prop.publishedAt,
          ownerId: prop.ownerId,
          images: {
            create: prop.images.map((url, index) => ({
              url,
              mimeType: 'image/jpeg',
              sizeBytes: 150000,
              order: index,
            })),
          },
        },
      });
      createdProps.push(created);
    }
    console.log(`✅ Seeded ${createdProps.length} demo listings across statuses.`);

    // 3. Seed Buyer Favorites
    const publishedProps = createdProps.filter((p) => p.status === Status.PUBLISHED);
    if (publishedProps.length >= 2) {
      for (const p of publishedProps.slice(0, 2)) {
        await prisma.favorite.upsert({
          where: {
            userId_propertyId: {
              userId: buyer.id,
              propertyId: p.id,
            },
          },
          update: {},
          create: {
            userId: buyer.id,
            propertyId: p.id,
          },
        });
      }
      console.log('✅ Seeded demo favorites for Buyer account.');
    }
  } else {
    console.log('✅ Owner properties already exist. Skipping property duplication.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
