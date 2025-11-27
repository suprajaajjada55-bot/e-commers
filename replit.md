# Nano Flows - AI-Enhanced Digital Products eCommerce Platform

## Overview

Nano Flows is a premium digital products marketplace built for 2026 standards, enabling the sale of digital software, templates, UI kits, plugins, AI prompts, and online tools. The platform features AI-powered search, secure authentication via Replit Auth, Stripe payment integration, and a modern, responsive UI built with React, TypeScript, and shadcn/ui components. The system emphasizes visual product showcasing with a tech-forward design approach inspired by modern marketplaces like Gumroad and Creative Market.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for complex animations

**Design System:**
- Custom color scheme with CSS variables for light/dark mode theming
- Typography using Inter (UI/body) and Space Grotesk (headings) from Google Fonts
- Consistent spacing primitives (2, 4, 8, 12, 16, 20) using Tailwind units
- Component library with variants for primary, secondary, destructive, outline, and ghost styles
- Responsive breakpoints with mobile-first approach

**Key Pages:**
- Home page with hero section, featured products, categories, testimonials
- Products listing with filtering capabilities
- Category browsing
- Deals/promotions page
- About Us with company timeline
- Contact page
- Product request form

**Component Architecture:**
- Reusable UI components in `/client/src/components/ui/`
- Feature components in `/client/src/components/`
- Page components in `/client/src/pages/`
- Custom hooks in `/client/src/hooks/`

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)

**API Structure:**
- RESTful API endpoints under `/api/` prefix
- Authentication endpoints (`/api/auth/*`)
- Product endpoints (`/api/products`, `/api/products/featured`, `/api/products/:id`)
- Cart management endpoints
- Order processing endpoints
- Review system endpoints
- Wishlist endpoints
- Search functionality (`/api/search`)
- Newsletter subscription (`/api/newsletter/subscribe`)
- Product requests (`/api/product-requests`)
- Announcements (`/api/announcements`)

**Business Logic:**
- Storage abstraction layer (`server/storage.ts`) implementing IStorage interface
- Separation of concerns with route handlers delegating to storage layer
- Type-safe database operations using Drizzle schemas

### Data Storage

**Database**: PostgreSQL (configured for Neon.tech or similar serverless PostgreSQL)

**Schema Design:**
- **users**: User profiles with email, name, avatar, timestamps
- **products**: Digital products with metadata (title, description, category, price, images, author, rating, downloads, tags, license info, version)
- **cart_items**: Shopping cart with user-product relationships
- **orders**: Order records with status, payment info, totals
- **order_items**: Line items for orders
- **reviews**: Product reviews with ratings
- **wishlist**: Saved products per user
- **sessions**: Server-side session storage

**Database Migrations:**
- Managed via Drizzle Kit
- Migration files in `/migrations/` directory
- Schema definitions in `/shared/schema.ts` with Zod validation schemas

### Authentication & Authorization

**Replit Auth Integration:**
- OpenID Connect (OIDC) based authentication
- Passport.js strategy for session management
- JWT claims stored in session
- User profile synchronization with database
- Session persistence in PostgreSQL
- Secure cookie configuration with environment-aware settings (secure flag in production)

**Session Security:**
- HTTP-only cookies
- SameSite attribute (none for production, lax for development)
- 7-day session TTL
- CSRF protection considerations
- Session secret from environment variables

### Payment Processing

**Stripe Integration:**
- Stripe.js and React Stripe.js for frontend payment forms
- Server-side payment intent creation
- Webhook handling for payment events (using raw body verification)
- Secure payment flow with client-server separation

### Search & Discovery

**AI-Powered Search:**
- Fuzzy matching capabilities
- Category filtering
- Live search suggestions via `/api/search` endpoint
- Voice input support (client-side)
- Product discovery through categories and featured collections

### Performance & SEO

**Optimization Strategies:**
- Lazy loading and infinite scroll options
- Image optimization with responsive images
- Server-side rendering considerations with Vite SSR setup
- Meta tags for SEO
- Semantic HTML structure

**Caching:**
- TanStack Query with infinite stale time
- LocalStorage for dismissed announcements and theme preferences
- Memoization for OIDC configuration (3600s cache)

### Development & Deployment

**Development Environment:**
- Vite dev server with HMR
- TypeScript strict mode enabled
- Path aliases for clean imports (@, @shared, @assets)
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)

**Build Process:**
- Vite for frontend bundling
- esbuild for backend bundling
- Output: `/dist/public/` for frontend, `/dist/` for backend
- ES modules throughout

**Environment Configuration:**
- Environment variables for database URL, session secret, Stripe keys, OIDC issuer
- Separate development and production configurations
- Database provisioning checks at startup

## External Dependencies

### Third-Party Services

**Replit Auth (OIDC Provider):**
- Handles user authentication
- Provides OAuth 2.0 / OpenID Connect flow
- Issues JWT tokens with user claims

**Stripe:**
- Payment processing
- Subscription management capabilities
- Webhook event handling
- Client libraries: @stripe/stripe-js, @stripe/react-stripe-js

**Database: PostgreSQL (Neon.tech or similar)**
- Serverless PostgreSQL connection via @neondatabase/serverless
- WebSocket support for real-time features
- Connection string from DATABASE_URL environment variable

### UI Component Libraries

**Radix UI:**
- Comprehensive set of unstyled, accessible UI primitives
- Components: accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, label, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, toggle, tooltip

**shadcn/ui:**
- Pre-styled components built on Radix UI
- Customizable via Tailwind CSS
- Component installation managed via components.json

### Development Tools

**Type Safety:**
- Zod for runtime validation
- Drizzle-Zod for schema-based validation generation

**Build & Bundling:**
- Vite with React plugin
- esbuild for server bundling
- PostCSS with Tailwind and Autoprefixer

**Code Quality:**
- TypeScript compiler for type checking
- Path resolution with tsconfig paths

### Asset Management

**Images:**
- Generated images stored in `/attached_assets/generated_images/`
- Product previews, avatars, hero images
- Vite alias @assets for clean imports

**Fonts:**
- Google Fonts CDN for web fonts
- Font families: Inter, Space Grotesk, DM Sans, Fira Code, Geist Mono, Architects Daughter

### State Management

**TanStack Query:**
- Server state caching and synchronization
- Query invalidation
- Optimistic updates
- Custom query client with credential-based fetching