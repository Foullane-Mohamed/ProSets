# ProSets - Digital Assets Marketplace

A secure marketplace for buying and selling digital assets (3D models, code snippets, templates, etc.) built with modern web technologies.

## 🚀 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Auth0** (Authentication)
- **Stripe** (Payments)
- **Radix UI** (Components)

### Backend
- **NestJS** (REST API)
- **Prisma ORM**
- **PostgreSQL**
- **JWT Authentication** (Auth0)
- **AWS S3** (File Storage)
- **Stripe** (Payment Processing)

## 📁 Project Structure

```
ProSets/
├── frontend/          # Next.js application
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities & API client
│   └── types/        # TypeScript types
├── backend/          # NestJS API
│   ├── src/
│   │   ├── asset/    # Asset management
│   │   ├── auth/     # Authentication
│   │   ├── order/    # Order processing
│   │   ├── payment/  # Stripe integration
│   │   └── storage/  # S3 file handling
│   └── prisma/       # Database schema & migrations
└── project.md        # Detailed execution plan
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+ installed
- PostgreSQL database running
- Auth0 account created
- Stripe account created
- AWS S3 bucket created

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ProSets
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables template
copy .env.example .env

# Edit .env with your actual values:
# - DATABASE_URL (PostgreSQL connection string)
# - AUTH0_ISSUER_URL
# - AUTH0_AUDIENCE
# - AWS credentials and bucket name
# - STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
```

**Run Prisma migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

**Start the backend server:**
```bash
npm run start:dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# The .env file already exists, but make sure it has these variables:
```

**Required environment variables in `frontend/.env`:**
- `AUTH0_SECRET` - ✅ Already generated and added
- `AUTH0_ISSUER_BASE_URL` - Your Auth0 domain
- `AUTH0_CLIENT_ID` - Your Auth0 client ID
- `AUTH0_CLIENT_SECRET` - Your Auth0 client secret
- `AUTH0_AUDIENCE` - Your Auth0 API audience
- `NEXT_PUBLIC_BASE_URL` - Frontend URL (http://localhost:3000)
- `NEXT_PUBLIC_API_URL` - Backend URL (http://localhost:3001)
- `NEXT_PUBLIC_STRIPE_KEY` - Stripe publishable key

**Start the frontend development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔐 Auth0 Configuration

The project uses Auth0 for authentication. The **Auth0 secret error** has been fixed by:

1. ✅ **Generated `AUTH0_SECRET`**: Added to `frontend/.env`
2. ✅ **Updated `lib/auth0.ts`**: Added clear documentation about required env vars
3. ✅ **Enhanced `proxy.ts`**: Added try/catch error handling with clear messages

### Auth0 Setup Steps:
1. Create an Auth0 application (Regular Web Application)
2. Configure Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
3. Configure Allowed Logout URLs: `http://localhost:3000`
4. Configure Allowed Web Origins: `http://localhost:3000`
5. Copy your credentials to both `frontend/.env` and `backend/.env`

## 💳 Stripe Configuration

1. Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add `STRIPE_SECRET_KEY` to `backend/.env`
3. Add `NEXT_PUBLIC_STRIPE_KEY` to `frontend/.env`
4. For webhooks, install Stripe CLI and forward events:
   ```bash
   stripe listen --forward-to localhost:3001/api/payments/webhook
   ```

## 📦 Database Schema

The application uses PostgreSQL with Prisma ORM:

- **Users**: Auth0 authenticated users with roles (ADMIN, SELLER, BUYER)
- **Assets**: Digital products with title, description, price, file storage keys
- **Orders**: Purchase orders with status tracking
- **OrderItems**: Join table for order-asset relationships

## 🚦 Running the Application

1. **Start Backend**: `cd backend && npm run start:dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Visit**: http://localhost:3000

## 📖 Key Features

- ✅ User authentication with Auth0
- ✅ Browse and search digital assets
- ✅ Secure file upload to AWS S3
- ✅ Stripe checkout integration
- ✅ User library of purchased assets
- ✅ Seller dashboard for asset management
- ✅ Role-based access control (Admin, Seller, Buyer)

## 🐛 Troubleshooting

### Auth0 Configuration Errors

#### Error: "Missing: domain" or "Missing: appBaseUrl"
**Cause**: Auth0 SDK can't find required environment variables.

**Solution**: ✅ **FIXED** - The correct environment variables have been added to `frontend/.env`:
- `AUTH0_ISSUER_BASE_URL` (provides the domain)
- `AUTH0_BASE_URL` (provides the appBaseUrl)

If you still see this error:
1. Verify `frontend/.env` contains both variables
2. Make sure the variable is named `AUTH0_BASE_URL` (not `APP_BASE_URL` or `NEXT_PUBLIC_BASE_URL`)
3. Restart the Next.js dev server

#### Error: "JWEInvalid: Invalid Compact JWE"
**Cause**: Auth0 SDK configuration is incomplete or browser has stale session cookies.

**Solution**:
1. Verify ALL Auth0 variables are set in `frontend/.env` (see list above)
2. Clear browser cookies for localhost:3000
3. Restart the Next.js dev server
4. Try logging in again

#### Error: "ikm" must be an instance of Uint8Array
**Cause**: `AUTH0_SECRET` is missing or undefined.

**Solution**: ✅ **FIXED** - `AUTH0_SECRET` has been generated and added to `frontend/.env`. If you still see this error:
1. Restart the Next.js dev server
2. Verify `AUTH0_SECRET` exists in `.env`
3. Make sure all other Auth0 variables are set correctly

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- Run `npx prisma migrate dev` to ensure schema is up to date

### CORS Errors
- Ensure `NEXT_PUBLIC_API_URL` points to `http://localhost:3001`
- Backend should allow CORS from frontend origin

## 📝 Available Scripts

### Backend
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npx prisma studio` - Open Prisma Studio (DB GUI)

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📄 Documentation

For detailed implementation plan, architecture decisions, and deployment guides, see [project.md](./project.md)

## 📧 Support

For issues or questions, please check:
1. The [project.md](./project.md) file for detailed troubleshooting
2. Auth0 and Stripe official documentation
3. Create an issue in the repository

## 📜 License

UNLICENSED - Private project
