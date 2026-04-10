"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Starting seeder...');
    const adminEmail = 'admin@omnilist.local';
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
        const passwordHash = await bcrypt.hash('Admin@123', 12);
        admin = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                role: 'ADMIN',
            },
        });
        console.log(`✅ Created Admin user: ${adminEmail} (password: Admin@123)`);
    }
    else {
        console.log('✅ Admin user already exists.');
    }
    const propertyCount = await prisma.property.count();
    if (propertyCount === 0) {
        console.log('No properties found. Seeding initial properties...');
        const mockProperties = [
            {
                title: 'Modern Glass Villa with Ocean Views',
                description: 'Experience unparalleled luxury in this modern glass villa. Featuring 270-degree ocean views, an infinity pool, smart home automation, and imported Italian marble floors. Designed by award-winning architects, this space seamlessly blends indoor and outdoor living.',
                location: 'Beverly Hills, CA',
                price: 5450000,
                status: client_1.Status.PUBLISHED,
                publishedAt: new Date(),
                images: [
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600607687930-cebc5a882aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1600607687644-aac4c15ae279?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                title: 'Minimalist Urban Penthouse',
                description: 'High above the bustling city sits this tranquil minimalist penthouse. With its open floor plan, floor-to-ceiling windows, exposed concrete accents, and a massive private terrace, it is the ultimate retreat for the modern professional.',
                location: 'Downtown Manhattan, NY',
                price: 3200000,
                status: client_1.Status.PUBLISHED,
                publishedAt: new Date(),
                images: [
                    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                title: 'Cozy Alpine Cabin Retreat',
                description: 'Escape to the mountains in this newly renovated luxury cabin. Warm wood finishings, a massive stone fireplace, heated floors, and direct ski-in/ski-out access make this the perfect winter home or rental investment.',
                location: 'Aspen, CO',
                price: 1850000,
                status: client_1.Status.PUBLISHED,
                publishedAt: new Date(),
                images: [
                    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1542314831-c6a4d14eccda?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
                ]
            },
            {
                title: 'Lakeside Architectural Marvel',
                description: 'A striking geometric masterpiece sitting right on the lake edge. Built with sustainable materials and powered entirely by hidden solar panels. Features private dock access, a separate guest house, and an underground wine cellar.',
                location: 'Lake Tahoe, NV',
                price: 2900000,
                status: client_1.Status.PUBLISHED,
                publishedAt: new Date(),
                images: [
                    'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
                ]
            }
        ];
        for (const prop of mockProperties) {
            await prisma.property.create({
                data: {
                    title: prop.title,
                    description: prop.description,
                    location: prop.location,
                    price: prop.price,
                    status: prop.status,
                    publishedAt: prop.publishedAt,
                    ownerId: admin.id,
                    images: {
                        create: prop.images.map((url, index) => ({
                            url,
                            mimeType: 'image/jpeg',
                            sizeBytes: 150000,
                            order: index
                        }))
                    }
                }
            });
        }
        console.log(`✅ Seeded ${mockProperties.length} high-end property listings.`);
    }
    else {
        console.log('✅ Properties already exist. Skipping property seed.');
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map