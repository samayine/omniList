# OmniList Backend

A RESTful API for a property listing platform, built with **NestJS**, **Prisma**, and **PostgreSQL**. This service handles authentication, property management, and role-based access control.

## Technical Overview

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based (Passport.js)
- **File Handling**: Local storage using Multer
- **API Docs**: Swagger/OpenAPI

## Related Repository
This is the backend API for the OmniList platform. The frontend repository can be found here:
**[OmniList Frontend](https://github.com/samayine/omniList-frontend)**

## Key Features

- **Role-Based Access**: Specialized permissions for `ADMIN`, `OWNER`, and `USER`.
- **Property Management**: Complete CRUD for listings including image uploads and status tracking.
- **Search & Filter**: Server-side pagination and filtering by price, location, and keywords.
- **Soft Deletes**: Records are marked as deleted rather than removed from the database for better data integrity.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   Create a `.env` file with your `DATABASE_URL` and `JWT_SECRET`.
   ```bash
   npx prisma generate
   npx prisma db push
   npm run prisma:seed
   ```

3. **Run the App**:
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation
Interactive documentation is available at `/api/docs` when the server is running.
