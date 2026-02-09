# 423D Built -- Technical Architecture Document

**Project**: 423D Built -- Tennessee-based 3D Printing & Laser Engraving Service
**Version**: 1.0
**Date**: February 2026

---

## Table of Contents

1. [Technology Stack Overview](#1-technology-stack-overview)
2. [Project File Structure](#2-project-file-structure)
3. [Database Schema (Prisma)](#3-database-schema-prisma)
4. [Authentication Architecture](#4-authentication-architecture)
5. [Admin Dashboard Architecture](#5-admin-dashboard-architecture)
6. [API Route Architecture](#6-api-route-architecture)
7. [Docker & Self-Hosting Setup](#7-docker--self-hosting-setup)
8. [Shipping Integration (GoShippo)](#8-shipping-integration-goshippo)
9. [Image Upload & Storage](#9-image-upload--storage)
10. [Environment Variables](#10-environment-variables)
11. [Migration & Backup Strategy](#11-migration--backup-strategy)
12. [Security Considerations](#12-security-considerations)

---

## 1. Technology Stack Overview

### Core Framework
- **Next.js 14.2+** (App Router) -- React framework with server components, server actions, and API routes
- **React 18** -- UI library with server/client component model
- **TypeScript** -- Type safety across the entire codebase

### Database & ORM
- **PostgreSQL 16** -- Primary database, containerized via Docker
- **Prisma 5.x** -- Type-safe ORM with migrations, seeding, and Prisma Studio

### Authentication
- **Auth.js v5 (NextAuth.js v5)** -- Authentication for the admin dashboard
  - Credentials provider (email/password) for admin login
  - Session strategy: JWT (stateless, works well with Docker)
  - Middleware-based route protection

### Styling & UI
- **Tailwind CSS 3.4+** -- Utility-first CSS framework
- **Framer Motion 11+** -- Animation library for page transitions, scroll animations, hover effects
- **Lucide React** -- Icon library (consistent, tree-shakeable)
- **clsx + tailwind-merge** -- Conditional class name composition

### Shipping
- **GoShippo Node.js SDK** -- Shipping label generation, rate calculation, tracking

### Infrastructure
- **Docker** -- Containerization of the Next.js app and PostgreSQL
- **Docker Compose** -- Multi-container orchestration
- **Nginx** -- Reverse proxy with SSL termination
- **Certbot / Let's Encrypt** -- Free SSL/TLS certificates
- **Local filesystem** -- Image/upload storage via Docker volumes

### Development Tools
- **ESLint** -- Code linting
- **Prettier** -- Code formatting
- **Prisma Studio** -- Visual database browser (development only)

### Why These Choices

| Decision | Rationale |
|----------|-----------|
| Next.js App Router (not Pages) | Server components reduce client JS bundle; server actions simplify form handling; layouts provide shared UI |
| Prisma (not Drizzle/Knex) | Best DX for PostgreSQL; auto-generated types; visual studio; mature migration system |
| Auth.js v5 (not Clerk/Lucia) | Self-hosted friendly (no external service); first-party Next.js support; free |
| PostgreSQL (not MySQL/SQLite) | JSON column support for flexible content; full-text search; best Prisma support; industry standard |
| Docker Compose (not K8s) | Simple single-server deployment; easy migration; appropriate scale for small business |
| Local filesystem (not S3) | No cloud dependency; simpler setup; Docker volume makes it portable |
| Nginx (not Caddy/Traefik) | Most documented; battle-tested; straightforward SSL with Certbot |

---

## 2. Project File Structure

```
423d-built/
|
|-- docker-compose.yml            # Production orchestration
|-- docker-compose.dev.yml        # Development overrides
|-- Dockerfile                    # Multi-stage Next.js build
|-- .env.example                  # Template for environment variables
|-- .env                          # Actual env vars (gitignored)
|-- .dockerignore
|-- .gitignore
|-- next.config.mjs               # Next.js configuration
|-- tailwind.config.ts            # Tailwind configuration
|-- tsconfig.json
|-- package.json
|-- postcss.config.mjs
|
|-- nginx/
|   |-- nginx.conf                # Nginx reverse proxy config
|   |-- certbot/                  # Let's Encrypt certificates (volume-mounted)
|
|-- prisma/
|   |-- schema.prisma             # Database schema
|   |-- migrations/               # Migration history
|   |-- seed.ts                   # Initial seed data (admin user, default content)
|
|-- public/
|   |-- logo.jpg
|   |-- favicon.ico
|   |-- robots.txt
|   |-- sitemap.xml
|
|-- uploads/                      # User-uploaded images (Docker volume)
|   |-- products/
|   |-- gallery/
|   |-- content/
|
|-- src/
|   |-- app/
|   |   |-- layout.tsx            # Root layout (fonts, metadata, providers)
|   |   |-- page.tsx              # Homepage
|   |   |-- globals.css           # Tailwind directives + custom CSS
|   |   |-- loading.tsx           # Global loading state
|   |   |-- not-found.tsx         # 404 page
|   |   |-- error.tsx             # Error boundary
|   |   |
|   |   |-- (storefront)/        # Route group: public-facing pages
|   |   |   |-- layout.tsx        # Storefront layout (navbar, footer)
|   |   |   |-- page.tsx          # Homepage (hero, featured, services)
|   |   |   |-- about/
|   |   |   |   |-- page.tsx
|   |   |   |-- services/
|   |   |   |   |-- page.tsx      # 3D printing & laser engraving services
|   |   |   |   |-- [slug]/
|   |   |   |       |-- page.tsx  # Individual service detail
|   |   |   |-- shop/
|   |   |   |   |-- page.tsx      # Product listing
|   |   |   |   |-- [slug]/
|   |   |   |       |-- page.tsx  # Product detail
|   |   |   |-- cart/
|   |   |   |   |-- page.tsx      # Shopping cart
|   |   |   |-- checkout/
|   |   |   |   |-- page.tsx      # Checkout flow
|   |   |   |   |-- success/
|   |   |   |       |-- page.tsx  # Order confirmation
|   |   |   |-- quote/
|   |   |   |   |-- page.tsx      # Custom quote request form
|   |   |   |-- gallery/
|   |   |   |   |-- page.tsx      # Portfolio/work gallery
|   |   |   |-- contact/
|   |   |   |   |-- page.tsx      # Contact page
|   |   |   |-- track/
|   |   |       |-- page.tsx      # Order tracking
|   |   |
|   |   |-- admin/                # Admin dashboard (protected)
|   |   |   |-- layout.tsx        # Admin layout (sidebar, topbar)
|   |   |   |-- page.tsx          # Dashboard overview (stats, recent orders)
|   |   |   |-- login/
|   |   |   |   |-- page.tsx      # Admin login page
|   |   |   |-- content/
|   |   |   |   |-- page.tsx      # CMS: edit hero, about, services text
|   |   |   |   |-- [section]/
|   |   |   |       |-- page.tsx  # Edit specific content section
|   |   |   |-- products/
|   |   |   |   |-- page.tsx      # Product list (table view)
|   |   |   |   |-- new/
|   |   |   |   |   |-- page.tsx  # Create product
|   |   |   |   |-- [id]/
|   |   |   |       |-- page.tsx  # Edit product
|   |   |   |-- orders/
|   |   |   |   |-- page.tsx      # Order list
|   |   |   |   |-- [id]/
|   |   |   |       |-- page.tsx  # Order detail (status, shipping)
|   |   |   |-- inquiries/
|   |   |   |   |-- page.tsx      # Service inquiry list
|   |   |   |   |-- [id]/
|   |   |   |       |-- page.tsx  # Inquiry detail + respond
|   |   |   |-- shipping/
|   |   |   |   |-- page.tsx      # Shipping settings, label management
|   |   |   |-- gallery/
|   |   |   |   |-- page.tsx      # Manage gallery images
|   |   |   |-- settings/
|   |   |       |-- page.tsx      # Site settings (colors, contact, etc.)
|   |   |
|   |   |-- api/
|   |       |-- auth/
|   |       |   |-- [...nextauth]/
|   |       |       |-- route.ts  # Auth.js catch-all API route
|   |       |-- upload/
|   |       |   |-- route.ts      # Image upload endpoint
|   |       |-- cart/
|   |       |   |-- route.ts      # Cart operations (cookie-based)
|   |       |-- checkout/
|   |       |   |-- route.ts      # Checkout + payment processing
|   |       |-- shipping/
|   |       |   |-- rates/
|   |       |   |   |-- route.ts  # Get shipping rates (GoShippo)
|   |       |   |-- labels/
|   |       |   |   |-- route.ts  # Create shipping label
|   |       |   |-- tracking/
|   |       |       |-- route.ts  # Track shipment
|   |       |-- webhooks/
|   |       |   |-- shippo/
|   |       |       |-- route.ts  # Shippo webhook handler
|   |       |-- inquiries/
|   |           |-- route.ts      # Submit quote/inquiry
|   |
|   |-- components/
|   |   |-- ui/                   # Reusable primitive components
|   |   |   |-- button.tsx
|   |   |   |-- input.tsx
|   |   |   |-- textarea.tsx
|   |   |   |-- select.tsx
|   |   |   |-- badge.tsx
|   |   |   |-- card.tsx
|   |   |   |-- dialog.tsx
|   |   |   |-- dropdown-menu.tsx
|   |   |   |-- table.tsx
|   |   |   |-- toast.tsx
|   |   |   |-- skeleton.tsx
|   |   |   |-- image-upload.tsx
|   |   |
|   |   |-- storefront/          # Public-facing components
|   |   |   |-- navbar.tsx
|   |   |   |-- footer.tsx
|   |   |   |-- hero.tsx
|   |   |   |-- featured-products.tsx
|   |   |   |-- services-overview.tsx
|   |   |   |-- testimonials.tsx
|   |   |   |-- product-card.tsx
|   |   |   |-- product-gallery.tsx
|   |   |   |-- cart-drawer.tsx
|   |   |   |-- cart-item.tsx
|   |   |   |-- checkout-form.tsx
|   |   |   |-- quote-form.tsx
|   |   |   |-- contact-form.tsx
|   |   |   |-- gallery-grid.tsx
|   |   |   |-- animated-section.tsx  # Framer Motion scroll reveal
|   |   |   |-- page-transition.tsx   # Framer Motion page transitions
|   |   |
|   |   |-- admin/               # Admin dashboard components
|   |   |   |-- sidebar.tsx
|   |   |   |-- topbar.tsx
|   |   |   |-- stats-cards.tsx
|   |   |   |-- recent-orders.tsx
|   |   |   |-- data-table.tsx        # Generic sortable/filterable table
|   |   |   |-- content-editor.tsx    # Rich text / markdown editor
|   |   |   |-- product-form.tsx
|   |   |   |-- order-status-badge.tsx
|   |   |   |-- order-timeline.tsx
|   |   |   |-- shipping-label-form.tsx
|   |   |   |-- inquiry-response-form.tsx
|   |   |   |-- image-manager.tsx
|   |   |   |-- settings-form.tsx
|   |   |   |-- color-picker.tsx
|   |
|   |-- lib/
|   |   |-- db.ts                 # Prisma client singleton
|   |   |-- auth.ts               # Auth.js configuration
|   |   |-- auth-helpers.ts       # getCurrentUser(), requireAdmin(), etc.
|   |   |-- shippo.ts             # GoShippo client initialization
|   |   |-- utils.ts              # General utilities (cn(), formatPrice(), etc.)
|   |   |-- validators.ts         # Zod schemas for form validation
|   |   |-- constants.ts          # App-wide constants
|   |   |-- upload.ts             # File upload utilities
|   |   |-- email.ts              # Email sending (nodemailer or resend)
|   |   |-- cart.ts               # Cart logic (cookie-based)
|   |
|   |-- actions/                  # Server Actions (form handlers)
|   |   |-- auth-actions.ts       # Login, logout
|   |   |-- product-actions.ts    # CRUD products
|   |   |-- order-actions.ts      # Update order status, process refunds
|   |   |-- content-actions.ts    # Update site content
|   |   |-- inquiry-actions.ts    # Respond to inquiries
|   |   |-- shipping-actions.ts   # Create labels, get rates
|   |   |-- settings-actions.ts   # Update site settings
|   |   |-- upload-actions.ts     # Handle file uploads
|   |   |-- cart-actions.ts       # Add/remove/update cart items
|   |   |-- checkout-actions.ts   # Process checkout
|   |
|   |-- hooks/
|   |   |-- use-cart.ts           # Cart state management
|   |   |-- use-toast.ts          # Toast notifications
|   |   |-- use-debounce.ts       # Debounced search/input
|   |   |-- use-media-query.ts    # Responsive breakpoints
|   |
|   |-- types/
|   |   |-- index.ts              # Shared TypeScript types
|   |   |-- prisma.ts             # Extended Prisma types (with relations)
|   |
|   |-- middleware.ts             # Auth middleware (protects /admin routes)
```

---

## 3. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// AUTHENTICATION & USERS
// ============================================================

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String?
  hashedPassword String
  role           UserRole  @default(ADMIN)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@map("users")
}

enum UserRole {
  ADMIN
  SUPER_ADMIN
}

// ============================================================
// PRODUCTS & CATALOG
// ============================================================

model Product {
  id          String          @id @default(cuid())
  name        String
  slug        String          @unique
  description String          @db.Text
  shortDesc   String?         @db.VarChar(300)

  // Pricing
  price       Decimal         @db.Decimal(10, 2)
  compareAt   Decimal?        @db.Decimal(10, 2)  // "Was" price for sales
  cost        Decimal?        @db.Decimal(10, 2)  // Internal cost tracking

  // Inventory
  sku         String?         @unique
  stock       Int             @default(0)
  trackStock  Boolean         @default(true)
  lowStockAt  Int             @default(5)

  // Categorization
  category    ProductCategory
  tags        String[]        // PostgreSQL array type

  // 3D Printing specific
  material       PrintMaterial?
  printTimeHours Float?
  layerHeight    Float?          // in mm (e.g., 0.2)
  infillPercent  Int?            // e.g., 20
  supportsUsed   Boolean?
  filamentColor  String?

  // Laser Engraving specific
  engravedMaterial   EngraveMaterial?
  engraveAreaWidth   Float?   // in inches
  engraveAreaHeight  Float?   // in inches
  customizable       Boolean  @default(false)  // Can customer send custom text/image?

  // Physical dimensions (for shipping)
  weightOz    Float?           // weight in ounces
  lengthIn    Float?           // length in inches
  widthIn     Float?           // width in inches
  heightIn    Float?           // height in inches

  // Status
  status      ProductStatus   @default(DRAFT)
  featured    Boolean         @default(false)
  sortOrder   Int             @default(0)

  // SEO
  metaTitle       String?
  metaDescription String?

  // Relations
  images     ProductImage[]
  variants   ProductVariant[]
  orderItems OrderItem[]
  cartItems  CartItem[]

  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([category])
  @@index([status])
  @@index([featured])
  @@map("products")
}

model ProductImage {
  id        String  @id @default(cuid())
  url       String  // relative path: /uploads/products/abc123.jpg
  alt       String?
  sortOrder Int     @default(0)
  isPrimary Boolean @default(false)

  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model ProductVariant {
  id        String  @id @default(cuid())
  name      String                  // e.g., "Blue PLA", "Large Oak"
  sku       String? @unique
  price     Decimal @db.Decimal(10, 2)
  stock     Int     @default(0)
  sortOrder Int     @default(0)

  // Variant-specific attributes (flexible JSON)
  attributes Json?  // e.g., { "color": "blue", "size": "large" }

  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  orderItems OrderItem[]
  cartItems  CartItem[]

  @@map("product_variants")
}

enum ProductCategory {
  PRINT_3D            // 3D printed items
  LASER_ENGRAVE       // Laser engraved items
  PRINT_AND_ENGRAVE   // Combination pieces
  ACCESSORIES         // Misc accessories
  CUSTOM              // Custom order products
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum PrintMaterial {
  PLA
  PETG
  ABS
  TPU
  NYLON
  ASA
  WOOD_PLA
  CARBON_FIBER
  SILK_PLA
  GLOW_PLA
  RESIN_STANDARD
  RESIN_TOUGH
  RESIN_FLEXIBLE
  OTHER
}

enum EngraveMaterial {
  WOOD_BIRCH
  WOOD_WALNUT
  WOOD_MAPLE
  WOOD_CHERRY
  WOOD_BAMBOO
  ACRYLIC_CLEAR
  ACRYLIC_BLACK
  ACRYLIC_COLOR
  LEATHER
  SLATE
  GLASS
  ANODIZED_ALUMINUM
  STAINLESS_STEEL
  COATED_METAL
  TILE_CERAMIC
  OTHER
}

// ============================================================
// SHOPPING CART (cookie-based session, DB for persistence)
// ============================================================

model Cart {
  id        String     @id @default(cuid())
  sessionId String     @unique  // Cookie-based session identifier
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([sessionId])
  @@map("carts")
}

model CartItem {
  id       String @id @default(cuid())
  quantity Int    @default(1)

  // Custom order fields (for customizable products)
  customText  String?  @db.Text
  customImage String?  // path to uploaded custom image
  customNotes String?  @db.Text

  cartId    String
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)

  productId String
  product   Product @relation(fields: [productId], references: [id])

  variantId String?
  variant   ProductVariant? @relation(fields: [variantId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId, variantId])
  @@map("cart_items")
}

// ============================================================
// ORDERS
// ============================================================

model Order {
  id          String       @id @default(cuid())
  orderNumber String       @unique  // Human-readable: 423D-00001
  status      OrderStatus  @default(PENDING)

  // Customer info (no customer accounts -- guest checkout)
  customerEmail String
  customerName  String
  customerPhone String?

  // Addresses
  shippingAddress Json    // { line1, line2, city, state, zip, country }
  billingAddress  Json?   // null = same as shipping

  // Totals
  subtotal      Decimal  @db.Decimal(10, 2)
  shippingCost  Decimal  @db.Decimal(10, 2) @default(0)
  taxAmount     Decimal  @db.Decimal(10, 2) @default(0)
  discountAmount Decimal @db.Decimal(10, 2) @default(0)
  total         Decimal  @db.Decimal(10, 2)

  // Payment
  paymentMethod  String?  // "square", "square", "paypal", etc.
  paymentId      String?  // External payment ID
  paymentStatus  PaymentStatus @default(PENDING)

  // Shipping
  shippingMethod String?  // e.g., "USPS Priority", "UPS Ground"
  shippingCarrier String?
  trackingNumber String?
  trackingUrl    String?
  shippoTransactionId String?  // GoShippo transaction/label ID
  labelUrl       String?       // Shipping label PDF URL
  shippedAt      DateTime?
  deliveredAt    DateTime?
  estimatedDelivery DateTime?

  // Notes
  customerNotes String? @db.Text
  internalNotes String? @db.Text

  // Relations
  items     OrderItem[]
  timeline  OrderEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([customerEmail])
  @@index([orderNumber])
  @@map("orders")
}

model OrderItem {
  id       String @id @default(cuid())
  quantity Int
  price    Decimal @db.Decimal(10, 2)  // Price at time of purchase
  total    Decimal @db.Decimal(10, 2)  // price * quantity

  // Snapshot of product details at purchase time
  productName String
  productSku  String?
  variantName String?

  // Custom order details
  customText  String? @db.Text
  customImage String?
  customNotes String? @db.Text

  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId String?
  product   Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  variantId String?
  variant   ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)

  @@map("order_items")
}

model OrderEvent {
  id          String @id @default(cuid())
  type        OrderEventType
  description String
  metadata    Json?   // Flexible data (e.g., tracking info, status changes)

  orderId String
  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([orderId])
  @@map("order_events")
}

enum OrderStatus {
  PENDING          // Just placed
  CONFIRMED        // Payment confirmed
  PROCESSING       // Being made/printed
  READY_TO_SHIP    // Completed, awaiting shipping
  SHIPPED          // In transit
  DELIVERED        // Arrived
  CANCELLED        // Cancelled
  REFUNDED         // Refunded
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum OrderEventType {
  CREATED
  PAYMENT_RECEIVED
  PAYMENT_FAILED
  STATUS_CHANGED
  NOTE_ADDED
  LABEL_CREATED
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

// ============================================================
// SERVICE INQUIRIES / QUOTE REQUESTS
// ============================================================

model ServiceInquiry {
  id        String        @id @default(cuid())
  type      InquiryType
  status    InquiryStatus @default(NEW)

  // Contact info
  name      String
  email     String
  phone     String?
  company   String?

  // Request details
  subject   String
  message   String        @db.Text
  budget    String?       // e.g., "$50-100", "$100-250"
  timeline  String?       // e.g., "1 week", "2 weeks", "flexible"
  quantity  Int?

  // 3D Print specific
  printMaterial   PrintMaterial?
  hasModel        Boolean?        // Customer has a 3D model file?
  modelFileUrl    String?         // Uploaded .stl/.obj file

  // Laser Engrave specific
  engraveMaterial EngraveMaterial?
  engraveSize     String?         // e.g., "4x6 inches"
  customDesign    Boolean?        // Need custom design work?

  // Attached files
  attachments     Json?           // Array of file paths

  // Admin response
  response        String?   @db.Text
  quotedPrice     Decimal?  @db.Decimal(10, 2)
  respondedAt     DateTime?
  respondedBy     String?   // Admin user ID

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([type])
  @@map("service_inquiries")
}

enum InquiryType {
  PRINT_3D
  LASER_ENGRAVE
  DESIGN_SERVICE
  BULK_ORDER
  GENERAL
}

enum InquiryStatus {
  NEW
  IN_REVIEW
  QUOTED
  ACCEPTED
  DECLINED
  COMPLETED
  ARCHIVED
}

// ============================================================
// CMS / SITE CONTENT
// ============================================================

model SiteContent {
  id        String @id @default(cuid())
  section   String @unique  // e.g., "hero", "about", "services_intro"
  content   Json            // Flexible JSON for each section's content
  // Example for "hero":
  // {
  //   "heading": "423D Built",
  //   "subheading": "3D Print & Design",
  //   "tagline": "Custom 3D printing and laser engraving in East Tennessee",
  //   "ctaText": "Shop Now",
  //   "ctaLink": "/shop",
  //   "backgroundImage": "/uploads/content/hero-bg.jpg"
  // }
  //
  // Example for "about":
  // {
  //   "heading": "About 423D Built",
  //   "body": "We are a Tennessee-based...",
  //   "image": "/uploads/content/about.jpg",
  //   "stats": [
  //     { "label": "Projects Completed", "value": "500+" },
  //     { "label": "Happy Customers", "value": "200+" }
  //   ]
  // }

  updatedAt DateTime @updatedAt

  @@map("site_content")
}

// ============================================================
// SITE SETTINGS
// ============================================================

model SiteSettings {
  id    String @id @default(cuid())
  key   String @unique  // e.g., "general", "theme", "shipping", "payment"
  value Json            // Setting values as JSON

  // "general":
  // {
  //   "siteName": "423D Built",
  //   "tagline": "3D Print & Design",
  //   "email": "contact@423dbuilt.com",
  //   "phone": "(423) 555-1234",
  //   "address": { "street": "...", "city": "...", "state": "TN", "zip": "..." },
  //   "socialLinks": {
  //     "facebook": "https://facebook.com/423dbuilt",
  //     "instagram": "https://instagram.com/423dbuilt",
  //     "tiktok": "..."
  //   }
  // }
  //
  // "theme":
  // {
  //   "primaryColor": "#D4A843",   // Gold from the logo
  //   "secondaryColor": "#1A1A1A", // Dark/black
  //   "accentColor": "#FFFFFF",
  //   "fontHeading": "Playfair Display",
  //   "fontBody": "Inter"
  // }
  //
  // "shipping":
  // {
  //   "shipFromAddress": { ... },
  //   "freeShippingThreshold": 75,
  //   "handlingFee": 0,
  //   "processingDays": 3,
  //   "defaultWeight": 8,
  //   "defaultDimensions": { "length": 6, "width": 6, "height": 4 }
  // }
  //
  // "payment":
  // {
  //   "provider": "square",
  //   "currency": "USD",
  //   "taxRate": 9.75,
  //   "taxEnabled": true
  // }

  updatedAt DateTime @updatedAt

  @@map("site_settings")
}

// ============================================================
// GALLERY / PORTFOLIO
// ============================================================

model GalleryImage {
  id          String  @id @default(cuid())
  url         String  // /uploads/gallery/image.jpg
  title       String?
  description String? @db.Text
  category    ProductCategory?
  tags        String[]
  featured    Boolean @default(false)
  sortOrder   Int     @default(0)

  createdAt DateTime @default(now())

  @@map("gallery_images")
}

// ============================================================
// SHIPPING SETTINGS (GoShippo)
// ============================================================

model ShippingRate {
  id           String  @id @default(cuid())
  name         String  // e.g., "Standard Shipping", "Priority"
  carrier      String  // e.g., "USPS", "UPS", "FedEx"
  serviceLevel String  // e.g., "usps_priority", "ups_ground"
  enabled      Boolean @default(true)

  // Flat rate override (null = use live rates from Shippo)
  flatRate     Decimal? @db.Decimal(10, 2)

  // Weight-based rules
  minWeightOz  Float?
  maxWeightOz  Float?

  // Order total rules
  minOrderTotal Decimal? @db.Decimal(10, 2)
  maxOrderTotal Decimal? @db.Decimal(10, 2)

  sortOrder    Int @default(0)

  @@map("shipping_rates")
}
```

### Schema Design Decisions

**Why JSON columns for content/settings?**
- Site content and settings are inherently flexible -- each section has different fields
- JSON columns in PostgreSQL are indexed and queryable
- Avoids the "EAV anti-pattern" (Entity-Attribute-Value) while keeping the schema simple
- Content changes do not require database migrations

**Why guest checkout (no customer accounts)?**
- Small business with low repeat-visit rate
- Reduces friction at checkout
- Customer data stored per-order (email for communication)
- Can add accounts later if needed

**Why snapshot product data in OrderItem?**
- Product names/prices can change after an order is placed
- OrderItem stores `productName`, `productSku`, `price` at the time of purchase
- Foreign key to Product uses `onDelete: SetNull` so order history survives product deletion

**Why separate OrderEvent model?**
- Provides a complete audit trail of everything that happened to an order
- Timeline view in admin dashboard
- Useful for debugging shipping/payment issues

---

## 4. Authentication Architecture

### Auth.js v5 Configuration

```typescript
// src/lib/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // NOTE: PrismaAdapter is not used with Credentials provider for session
  // storage. We use JWT strategy instead. The adapter is only listed here
  // for reference if you add OAuth providers later.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      return session;
    },
  },
});
```

### Middleware-Based Route Protection

```typescript
// src/middleware.ts

import { auth } from "@/lib/auth";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";
  const isAuthenticated = !!req.auth;

  // Allow login page always
  if (isLoginPage) {
    if (isAuthenticated) {
      return Response.redirect(new URL("/admin", req.url));
    }
    return;
  }

  // Protect all /admin routes
  if (isAdminRoute && !isAuthenticated) {
    return Response.redirect(new URL("/admin/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

### Key Auth Decisions

| Decision | Rationale |
|----------|-----------|
| JWT session strategy | Stateless; no session table needed; works perfectly in Docker |
| Credentials provider only | Admin-only auth; no need for Google/GitHub OAuth |
| bcryptjs for passwords | Industry standard; works in Edge runtime |
| Middleware protection | Runs before page renders; no flash of unauthorized content |
| No PrismaAdapter for sessions | JWT does not store sessions in DB; adapter only needed for OAuth |

---

## 5. Admin Dashboard Architecture

### Layout Structure

The admin dashboard uses a persistent sidebar layout with a top bar:

```
+----------------------------------------------------------+
| [Logo] 423D Built Admin              [User] [Logout]     |  <-- Topbar
+----------+-----------------------------------------------+
|          |                                                |
| Dashboard|  Dashboard Overview                            |
| Products |  +----------+ +----------+ +----------+       |
| Orders   |  | Orders   | | Revenue  | | Products |       |
| Inquiries|  | Today: 5 | | $1,234   | | Active:42|       |
| Content  |  +----------+ +----------+ +----------+       |
| Gallery  |                                                |
| Shipping |  Recent Orders                                 |
| Settings |  +------------------------------------------+  |
|          |  | #423D-00042 | John D. | $45.00 | Ship.. |  |
|          |  | #423D-00041 | Jane S. | $89.00 | Proc.. |  |
|          |  +------------------------------------------+  |
|          |                                                |
+----------+-----------------------------------------------+
```

### Server Components vs. Client Components Strategy

| Component | Type | Reason |
|-----------|------|--------|
| Admin layout (sidebar, topbar) | Server | Static structure; auth check on server |
| Dashboard stats cards | Server | Data fetched on server; no interactivity |
| Data tables (products, orders) | Client | Sorting, filtering, pagination interactions |
| Forms (product edit, settings) | Client | User input, validation, file uploads |
| Content editor | Client | Rich text editing requires DOM access |
| Image manager | Client | Drag-and-drop, preview, upload progress |
| Order timeline | Server | Read-only display of events |
| Status badge | Server | Simple display component |
| Toast notifications | Client | Dynamic notifications |
| Dialog/modal | Client | Open/close state management |

### Data Fetching Pattern

Admin pages use **server components with direct Prisma queries** (not API routes):

```typescript
// src/app/admin/products/page.tsx (Server Component)

import { db } from "@/lib/db";
import { ProductDataTable } from "@/components/admin/data-table";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { images: { where: { isPrimary: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1>Products</h1>
      <ProductDataTable data={products} />
    </div>
  );
}
```

Mutations use **server actions**:

```typescript
// src/actions/product-actions.ts
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productSchema } from "@/lib/validators";

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = productSchema.parse(Object.fromEntries(formData));

  const product = await db.product.create({
    data: {
      ...validated,
      slug: slugify(validated.name),
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}
```

---

## 6. API Route Architecture

API routes are used only where server actions are not appropriate:

| Route | Method | Purpose | Why Not Server Action? |
|-------|--------|---------|----------------------|
| `/api/auth/[...nextauth]` | GET/POST | Auth.js handlers | Required by Auth.js |
| `/api/upload` | POST | Image upload | Needs streaming/progress |
| `/api/cart` | GET/POST/PUT/DELETE | Cart operations | Called from client-side JS |
| `/api/shipping/rates` | POST | Get Shippo rates | Async external API call from client |
| `/api/shipping/labels` | POST | Create label | Admin action with external API |
| `/api/shipping/tracking` | GET | Track shipment | Public tracking page |
| `/api/webhooks/shippo` | POST | Shippo callbacks | External webhook receiver |
| `/api/checkout` | POST | Process checkout | Complex multi-step with payment |
| `/api/inquiries` | POST | Submit inquiry form | Public form submission |

Everything else (admin CRUD, content editing, settings) uses **server actions** because they integrate naturally with forms and `revalidatePath`.

---

## 7. Docker & Self-Hosting Setup

### Dockerfile (Multi-Stage Build)

```dockerfile
# Dockerfile

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
# Generate Prisma client (needs schema)
COPY prisma ./prisma
RUN npx prisma generate

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for public env vars (baked into client bundle)
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build

# ---- Stage 3: Production ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

### next.config.mjs

```javascript
// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",  // CRITICAL for Docker -- creates self-contained output
  images: {
    remotePatterns: [],  // No remote images; all served locally
  },
  // Serve uploaded files from /uploads path
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",  // or serve via Nginx directly
      },
    ];
  },
};

export default nextConfig;
```

### Docker Compose (Production)

```yaml
# docker-compose.yml

services:
  # ---- PostgreSQL Database ----
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-423dbuilt}
      POSTGRES_USER: ${POSTGRES_USER:-423dbuilt}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"  # Only accessible from localhost
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-423dbuilt}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  # ---- Next.js Application ----
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:-https://423dbuilt.com}
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-423dbuilt}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-423dbuilt}
      NEXTAUTH_URL: ${NEXT_PUBLIC_SITE_URL:-https://423dbuilt.com}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:?Set NEXTAUTH_SECRET in .env}
      SHIPPO_API_KEY: ${SHIPPO_API_KEY:-}
      SQUARE_SECRET_KEY: ${SQUARE_SECRET_KEY:-}
      SQUARE_WEBHOOK_SECRET: ${SQUARE_WEBHOOK_SECRET:-}
      UPLOAD_DIR: /app/uploads
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      db:
        condition: service_healthy
    networks:
      - internal

  # ---- Nginx Reverse Proxy ----
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - certbot_certs:/etc/letsencrypt:ro
      - certbot_www:/var/www/certbot:ro
      - uploads_data:/app/uploads:ro  # Serve uploads directly via Nginx
    depends_on:
      - app
    networks:
      - internal

  # ---- Certbot (SSL) ----
  certbot:
    image: certbot/certbot
    volumes:
      - certbot_certs:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - internal

volumes:
  postgres_data:
    driver: local
  uploads_data:
    driver: local
  certbot_certs:
    driver: local
  certbot_www:
    driver: local

networks:
  internal:
    driver: bridge
```

### Docker Compose (Development)

```yaml
# docker-compose.dev.yml

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: 423dbuilt_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpassword
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_dev_data:
    driver: local
```

### Nginx Configuration

```nginx
# nginx/nginx.conf

events {
    worker_connections 1024;
}

http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml image/svg+xml;

    # File upload size limit
    client_max_body_size 50M;

    # Redirect HTTP -> HTTPS
    server {
        listen 80;
        server_name 423dbuilt.com www.423dbuilt.com;

        # Certbot challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name 423dbuilt.com www.423dbuilt.com;

        ssl_certificate /etc/letsencrypt/live/423dbuilt.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/423dbuilt.com/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Serve uploaded files directly via Nginx (fast, bypasses Node)
        location /uploads/ {
            alias /app/uploads/;
            expires 7d;
            add_header Cache-Control "public, immutable";
        }

        # Static assets (Next.js)
        location /_next/static/ {
            proxy_pass http://app:3000;
            expires 365d;
            add_header Cache-Control "public, immutable";
        }

        # Rate limit login endpoint
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Rate limit API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # All other requests -> Next.js
        location / {
            proxy_pass http://app:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

### Initial SSL Certificate Setup

```bash
# Run once to get initial certificates (before enabling HTTPS in nginx.conf):

# 1. Start with HTTP-only nginx config first
# 2. Run certbot:
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  -d 423dbuilt.com \
  -d www.423dbuilt.com \
  --email admin@423dbuilt.com \
  --agree-tos \
  --no-eff-email

# 3. Switch nginx.conf to HTTPS version and restart:
docker compose restart nginx
```

---

## 8. Shipping Integration (GoShippo)

### Shippo Client Setup

```typescript
// src/lib/shippo.ts

import { Shippo } from "shippo";

const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY!,
});

export { shippo };
```

### Rate Calculation Flow

```
Customer enters address at checkout
        |
        v
POST /api/shipping/rates
  {
    addressTo: { ... },       // Customer address
    parcels: [{ ... }],       // From product dimensions
  }
        |
        v
Server calls Shippo API:
  shippo.shipments.create({
    addressFrom: <from site settings>,
    addressTo: <customer address>,
    parcels: <calculated from cart items>,
  })
        |
        v
Returns available rates:
  [
    { carrier: "USPS", service: "Priority", rate: "8.50", days: 2 },
    { carrier: "USPS", service: "Ground Advantage", rate: "5.25", days: 5 },
    { carrier: "UPS", service: "Ground", rate: "9.75", days: 3 },
  ]
        |
        v
Customer selects a rate -> stored with order
```

### Label Creation Flow (Admin)

```
Admin views order -> clicks "Create Shipping Label"
        |
        v
Server action: createShippingLabel(orderId, rateId)
        |
        v
  shippo.transactions.create({
    rate: rateId,        // Selected rate from Shippo
    labelFileType: "PDF",
    async: false,
  })
        |
        v
Returns:
  - labelUrl (PDF to print)
  - trackingNumber
  - trackingUrl
        |
        v
Updates order record:
  - trackingNumber
  - trackingUrl
  - labelUrl
  - shippoTransactionId
  - status -> SHIPPED
        |
        v
Creates OrderEvent: LABEL_CREATED
Sends email to customer with tracking info
```

### Webhook Handler

```typescript
// src/app/api/webhooks/shippo/route.ts

// Listens for tracking status updates from Shippo
// Updates order status when package is delivered
// Creates OrderEvent entries for tracking milestones
```

---

## 9. Image Upload & Storage

### Storage Strategy

Images are stored on the **local filesystem** inside a Docker volume:

```
/app/uploads/
  products/       # Product images
    abc123.webp
    def456.webp
  gallery/        # Portfolio/gallery images
    ghi789.webp
  content/        # CMS content images (hero bg, about photo)
    hero-bg.webp
  inquiries/      # Customer-uploaded files for quotes
    jkl012.stl
    mno345.pdf
```

### Upload Flow

```
1. Client sends file to POST /api/upload
2. Server validates: file type, size (max 10MB for images, 50MB for 3D files)
3. Server processes image: resize, convert to WebP (using sharp)
4. Server saves to /app/uploads/<category>/<cuid>.webp
5. Server returns relative path: /uploads/products/abc123.webp
6. Path stored in database (ProductImage.url, SiteContent.content, etc.)
```

### Serving Uploads

Nginx serves files from the `/uploads/` path directly (no Node.js involvement):

```nginx
location /uploads/ {
    alias /app/uploads/;
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

### Why Local Filesystem (Not S3)?

- **Zero cloud dependency** -- entire stack is self-hosted
- **Simpler architecture** -- no AWS credentials, IAM policies, CORS configuration
- **Docker volume** makes it portable -- `docker compose down && scp` and you are done
- **Nginx serves static files** efficiently (no Node.js bottleneck)
- **Appropriate scale** -- a small business site will have hundreds, not millions of images
- If you outgrow this, migrating to S3 later is straightforward (change the upload function + add a CDN)

---

## 10. Environment Variables

```bash
# .env.example

# ============================================================
# Database
# ============================================================
POSTGRES_DB=423dbuilt
POSTGRES_USER=423dbuilt
POSTGRES_PASSWORD=          # CHANGE THIS -- generate with: openssl rand -hex 32

# Connection string (used by Prisma inside Docker)
DATABASE_URL=postgresql://423dbuilt:YOUR_PASSWORD@db:5432/423dbuilt

# ============================================================
# Authentication
# ============================================================
NEXTAUTH_URL=https://423dbuilt.com
NEXTAUTH_SECRET=            # CHANGE THIS -- generate with: openssl rand -hex 32

# Initial admin credentials (used by seed script only)
ADMIN_EMAIL=admin@423dbuilt.com
ADMIN_PASSWORD=             # CHANGE THIS

# ============================================================
# Shipping (GoShippo)
# ============================================================
SHIPPO_API_KEY=             # From https://apps.goshippo.com/settings/api
SHIPPO_WEBHOOK_SECRET=      # Webhook verification secret

# ============================================================
# Payment (Square -- or swap for Square/PayPal)
# ============================================================
SQUARE_SECRET_KEY=
SQUARE_PUBLISHABLE_KEY=
SQUARE_WEBHOOK_SECRET=

# ============================================================
# Email (optional -- for order confirmations, inquiry responses)
# ============================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@423dbuilt.com

# ============================================================
# Application
# ============================================================
NEXT_PUBLIC_SITE_URL=https://423dbuilt.com
UPLOAD_DIR=/app/uploads
NODE_ENV=production
```

---

## 11. Migration & Backup Strategy

### Migrating to a New Server

The entire application can be moved to a new server with these steps:

```bash
# ON THE OLD SERVER:

# 1. Stop the application
docker compose down

# 2. Backup the database
docker compose up -d db
docker compose exec db pg_dump -U 423dbuilt 423dbuilt > backup.sql
docker compose down

# 3. Backup uploads
tar czf uploads-backup.tar.gz -C /var/lib/docker/volumes/ \
  $(docker volume inspect 423d-built_uploads_data -f '{{.Name}}')

# 4. Copy everything to new server
scp docker-compose.yml new-server:~/423d-built/
scp .env new-server:~/423d-built/
scp nginx/nginx.conf new-server:~/423d-built/nginx/
scp backup.sql new-server:~/423d-built/
scp uploads-backup.tar.gz new-server:~/423d-built/


# ON THE NEW SERVER:

# 1. Start the database
cd ~/423d-built
docker compose up -d db

# 2. Restore the database
docker compose exec -T db psql -U 423dbuilt 423dbuilt < backup.sql

# 3. Restore uploads
docker compose up -d app   # creates the volume
docker cp uploads-backup.tar.gz $(docker compose ps -q app):/tmp/
docker compose exec app tar xzf /tmp/uploads-backup.tar.gz -C /app/uploads/

# 4. Start everything
docker compose up -d

# 5. Restore SSL certificates (or generate new ones with certbot)
```

### Automated Backups

```bash
#!/bin/bash
# backup.sh -- run via cron: 0 3 * * * /opt/423d-built/backup.sh

BACKUP_DIR="/opt/backups/423d-built"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Database backup
docker compose -f /opt/423d-built/docker-compose.yml exec -T db \
  pg_dump -U 423dbuilt 423dbuilt | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Uploads backup (incremental with rsync would be better for large volumes)
tar czf "$BACKUP_DIR/uploads_$DATE.tar.gz" \
  -C /var/lib/docker/volumes/423d-built_uploads_data/_data .

# Retain only last 7 days
find "$BACKUP_DIR" -type f -mtime +7 -delete
```

### Prisma Migrations

```bash
# Development: create a new migration after schema changes
npx prisma migrate dev --name add_product_weight_field

# Production: migrations run automatically on container start
# (see Dockerfile CMD: "npx prisma migrate deploy && node server.js")

# This ensures the database schema is always in sync when deploying
```

---

## 12. Security Considerations

### Authentication & Authorization
- Admin routes protected by Auth.js middleware (runs before page render)
- JWT tokens with short expiry (default 30 days, configurable)
- Passwords hashed with bcryptjs (cost factor 12)
- Server actions verify session before any mutation
- Rate limiting on login endpoint (Nginx: 3 requests/minute)

### Input Validation
- All form inputs validated with **Zod** schemas on the server
- Server actions and API routes never trust client data
- File uploads validated: type whitelist, size limits, magic byte checking

### Network Security
- PostgreSQL only accessible on `127.0.0.1:5432` (not exposed to internet)
- Docker internal network isolates services
- Nginx adds security headers (HSTS, X-Frame-Options, CSP)
- SSL/TLS enforced with Let's Encrypt auto-renewal
- HTTP automatically redirected to HTTPS

### File Upload Security
- Allowed types: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`, `.stl`, `.obj`, `.3mf`, `.pdf`
- Max sizes: 10MB for images, 50MB for 3D model files
- Files renamed to random CUIDs (no user-controlled filenames)
- Images re-processed with `sharp` (strips EXIF data, re-encodes)
- Uploads directory has no execute permissions

### Environment Variables
- `.env` file is gitignored
- Secrets generated with `openssl rand -hex 32`
- Docker Compose validates required vars with `?` syntax
- No secrets baked into the Docker image (passed at runtime)

### CSRF Protection
- Server actions have built-in CSRF protection (Next.js)
- API routes use same-origin checks
- Auth.js handles CSRF for authentication endpoints

---

## Appendix A: Recommended Package List

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-auth": "^5.0.0-beta.25",
    "@auth/prisma-adapter": "^2.0.0",
    "@prisma/client": "^5.22.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.23.0",
    "framer-motion": "^11.15.0",
    "sharp": "^0.33.0",
    "shippo": "^3.0.0",
    "square": "^17.0.0",
    "nodemailer": "^6.9.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.468.0",
    "date-fns": "^4.1.0",
    "slugify": "^1.6.6",
    "@tanstack/react-table": "^8.20.0",
    "react-dropzone": "^14.3.0",
    "react-hot-toast": "^2.4.0",
    "sonner": "^1.7.0"
  },
  "devDependencies": {
    "prisma": "^5.22.0",
    "typescript": "^5.6.0",
    "@types/react": "^18.3.0",
    "@types/node": "^22.0.0",
    "@types/bcryptjs": "^2.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "tsx": "^4.19.0"
  }
}
```

---

## Appendix B: Entity Relationship Diagram (Text)

```
                    +------------------+
                    |      User        |
                    | (Admin accounts) |
                    +------------------+

+------------+      +-------------+      +---------------+
|  Product   |----->| ProductImage|      | SiteContent   |
|            |----->| ProductVar  |      | (CMS sections)|
+-----+------+      +-------------+      +---------------+
      |
      |  referenced by                   +---------------+
      +--------------------------------->| CartItem      |
      |                                  +-------+-------+
      |                                          |
      |                                  +-------+-------+
      |                                  |     Cart      |
      |                                  | (session-based)|
      |                                  +---------------+
      |
      |  referenced by
      +--------------------------------->| OrderItem     |
                                         +-------+-------+
                                                 |
                                         +-------+-------+
                                         |     Order     |----> OrderEvent
                                         | (guest order) |      (audit trail)
                                         +---------------+

+------------------+    +-----------------+    +----------------+
| ServiceInquiry   |    | SiteSettings    |    | GalleryImage   |
| (quote requests) |    | (key-value JSON)|    | (portfolio)    |
+------------------+    +-----------------+    +----------------+

+------------------+
|  ShippingRate    |
| (rate configs)   |
+------------------+
```

---

## Appendix C: Development Workflow

```bash
# First-time setup
git clone <repo>
cp .env.example .env           # Edit with your values
docker compose -f docker-compose.dev.yml up -d   # Start PostgreSQL
npm install
npx prisma migrate dev         # Apply migrations + generate client
npx prisma db seed             # Seed admin user + default content
npm run dev                    # Start Next.js dev server on :3000

# Daily development
npm run dev                    # http://localhost:3000
npx prisma studio              # http://localhost:5555 (visual DB browser)

# After schema changes
npx prisma migrate dev --name describe_change

# Production deployment
docker compose build
docker compose up -d

# View logs
docker compose logs -f app
docker compose logs -f nginx
```

---

## Appendix D: Seed Script Outline

```typescript
// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // 1. Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);
  await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL! },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL!,
      name: "Admin",
      hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  // 2. Create default site content
  const defaultContent = [
    {
      section: "hero",
      content: {
        heading: "423D Built",
        subheading: "3D Print & Design",
        tagline: "Custom 3D printing and laser engraving in East Tennessee",
        ctaText: "Shop Now",
        ctaLink: "/shop",
        backgroundImage: null,
      },
    },
    {
      section: "about",
      content: {
        heading: "About 423D Built",
        body: "We are a Tennessee-based 3D printing and laser engraving service...",
        image: null,
        stats: [],
      },
    },
    {
      section: "services_intro",
      content: {
        heading: "Our Services",
        body: "From custom 3D prints to precision laser engraving...",
        services: [
          {
            name: "3D Printing",
            description: "Custom FDM and resin printing",
            icon: "printer",
          },
          {
            name: "Laser Engraving",
            description: "Precision engraving on wood, acrylic, metal, and more",
            icon: "zap",
          },
          {
            name: "Custom Design",
            description: "3D modeling and design services",
            icon: "pencil-ruler",
          },
        ],
      },
    },
    {
      section: "footer",
      content: {
        tagline: "Crafted in Tennessee",
        copyright: "2026 423D Built. All rights reserved.",
      },
    },
  ];

  for (const item of defaultContent) {
    await db.siteContent.upsert({
      where: { section: item.section },
      update: {},
      create: item,
    });
  }

  // 3. Create default site settings
  const defaultSettings = [
    {
      key: "general",
      value: {
        siteName: "423D Built",
        tagline: "3D Print & Design",
        email: "contact@423dbuilt.com",
        phone: "",
        address: { street: "", city: "", state: "TN", zip: "" },
        socialLinks: { facebook: "", instagram: "", tiktok: "" },
      },
    },
    {
      key: "theme",
      value: {
        primaryColor: "#D4A843",
        secondaryColor: "#1A1A1A",
        accentColor: "#FFFFFF",
        fontHeading: "Playfair Display",
        fontBody: "Inter",
      },
    },
    {
      key: "shipping",
      value: {
        shipFromAddress: {
          name: "423D Built",
          street1: "",
          city: "",
          state: "TN",
          zip: "",
          country: "US",
        },
        freeShippingThreshold: 75,
        handlingFee: 0,
        processingDays: 3,
      },
    },
    {
      key: "payment",
      value: {
        provider: "square",
        currency: "USD",
        taxRate: 9.75,
        taxEnabled: true,
      },
    },
  ];

  for (const setting of defaultSettings) {
    await db.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // 4. Create default shipping rates
  await db.shippingRate.createMany({
    data: [
      {
        name: "Standard Shipping",
        carrier: "USPS",
        serviceLevel: "usps_ground_advantage",
        enabled: true,
        sortOrder: 0,
      },
      {
        name: "Priority Shipping",
        carrier: "USPS",
        serviceLevel: "usps_priority",
        enabled: true,
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
```

---

## Summary: Quick-Start Deployment Checklist

1. **Provision a VPS** (e.g., DigitalOcean Droplet, Hetzner, Linode) -- 2GB RAM minimum
2. **Install Docker & Docker Compose** on the server
3. **Clone the repo** and copy `.env.example` to `.env`
4. **Fill in `.env`** -- generate secrets, add Shippo/Square keys
5. **Point your domain** (DNS A record) to the server IP
6. **Get SSL certificate** with Certbot
7. **Run `docker compose up -d`** -- PostgreSQL, Next.js, and Nginx all start
8. **Migrations run automatically** on first boot
9. **Seed the database**: `docker compose exec app npx prisma db seed`
10. **Log in** at `https://423dbuilt.com/admin/login` with your admin credentials
11. **Customize** content, add products, configure shipping

The entire stack is contained in Docker. To migrate, back up the volumes and `.env`, copy them to a new server, and run `docker compose up -d`.
