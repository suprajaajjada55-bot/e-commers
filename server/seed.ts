import { db } from "./db";
import * as schema from "@shared/schema";
import { hashPassword } from "./authUtils";

const categories = ["UI Kits", "Templates", "Plugins", "AI Tools", "Code Scripts", "Mobile Apps"];

const sampleProducts = [
  {
    title: "Modern Dashboard UI Kit",
    description: "A comprehensive UI kit with 200+ components for building modern dashboards. Includes dark mode support, responsive layouts, and customizable themes. Perfect for SaaS applications, admin panels, and data visualization projects.",
    shortDescription: "200+ components for modern dashboards with dark mode",
    category: "UI Kits",
    price: "49.00",
    image: "/products/ui-kit.png",
    author: "DesignStudio",
    rating: "4.9",
    downloads: 1240,
    isFeatured: true,
    tags: ["dashboard", "admin", "ui-kit", "react"],
    licenseType: "Standard License",
    fileSize: "45 MB",
    version: "2.1.0",
  },
  {
    title: "Premium Landing Page Template",
    description: "High-converting landing page template with 15+ sections. Built with Next.js and Tailwind CSS. Includes hero sections, pricing tables, testimonials, and more. Fully responsive and SEO optimized.",
    shortDescription: "High-converting Next.js landing page with 15+ sections",
    category: "Templates",
    price: "39.00",
    image: "/products/website-template.png",
    author: "WebCraft",
    rating: "4.8",
    downloads: 980,
    isFeatured: true,
    tags: ["landing-page", "nextjs", "tailwind", "seo"],
    licenseType: "Extended License",
    fileSize: "12 MB",
    version: "1.5.0",
  },
  {
    title: "E-commerce Mobile UI Kit",
    description: "Complete mobile app UI kit for e-commerce applications. 150+ screens covering product browsing, cart management, checkout flow, and user profiles. Available in Figma and Sketch formats.",
    shortDescription: "150+ mobile screens for e-commerce apps",
    category: "UI Kits",
    price: "59.00",
    image: "/products/modern-digital.jpg",
    author: "MobileFirst",
    rating: "5.0",
    downloads: 756,
    isFeatured: true,
    tags: ["mobile", "ecommerce", "figma", "sketch"],
    licenseType: "Standard License",
    fileSize: "89 MB",
    version: "3.0.0",
  },
  {
    title: "SaaS Website Template",
    description: "Professional SaaS website template with authentication, pricing pages, documentation, and blog. Built with React and includes Stripe integration for payments. Fully customizable and well-documented.",
    shortDescription: "Complete SaaS website with auth and payments",
    category: "Templates",
    price: "45.00",
    image: "/products/modern-digital.jpg",
    author: "TechTemplates",
    rating: "4.7",
    downloads: 1120,
    isFeatured: true,
    tags: ["saas", "react", "stripe", "auth"],
    licenseType: "Standard License",
    fileSize: "28 MB",
    version: "2.0.0",
  },
  {
    title: "AI Content Generator Plugin",
    description: "WordPress plugin that integrates OpenAI to generate blog posts, product descriptions, and marketing copy. Supports multiple AI models and includes advanced customization options.",
    shortDescription: "WordPress AI content generation with OpenAI",
    category: "Plugins",
    price: "79.00",
    image: "/products/modern-digital.jpg",
    author: "AIPlugins",
    rating: "4.9",
    downloads: 543,
    isFeatured: true,
    tags: ["wordpress", "ai", "openai", "content"],
    licenseType: "Extended License",
    fileSize: "3 MB",
    version: "1.8.0",
  },
  {
    title: "Smart Form Builder",
    description: "Drag-and-drop form builder with conditional logic, file uploads, and payment integration. Export forms to React, Vue, or HTML. Includes validation, multi-step forms, and analytics.",
    shortDescription: "Drag-and-drop form builder with payments",
    category: "AI Tools",
    price: "69.00",
    image: "/products/professional-digital.jpg",
    author: "FormWizard",
    rating: "4.6",
    downloads: 892,
    isFeatured: true,
    tags: ["forms", "builder", "payments", "validation"],
    licenseType: "Standard License",
    fileSize: "15 MB",
    version: "4.2.0",
  },
  {
    title: "React Animation Library",
    description: "200+ pre-built animations and transitions for React applications. Includes scroll-based animations, hover effects, page transitions, and loading states. TypeScript support included.",
    shortDescription: "200+ animations for React with TypeScript",
    category: "Code Scripts",
    price: "35.00",
    image: "/products/professional-digital.jpg",
    author: "AnimatePro",
    rating: "4.8",
    downloads: 1456,
    isFeatured: true,
    tags: ["react", "animation", "typescript", "framer-motion"],
    licenseType: "Standard License",
    fileSize: "8 MB",
    version: "3.5.0",
  },
  {
    title: "Mobile Fitness Tracker App",
    description: "Complete fitness tracking app with workout plans, nutrition tracking, and progress analytics. Built with React Native. Includes backend API and database setup guides.",
    shortDescription: "React Native fitness app with backend",
    category: "Mobile Apps",
    price: "89.00",
    image: "/products/ui-kit.png",
    author: "FitAppStudio",
    rating: "4.7",
    downloads: 432,
    isFeatured: true,
    tags: ["react-native", "fitness", "health", "mobile"],
    licenseType: "Extended License",
    fileSize: "156 MB",
    version: "2.3.0",
  },
];

async function seed() {
  console.log("Seeding database...");

  const adminPasswordHash = await hashPassword("admin123");
  const userPasswordHash = await hashPassword("user123");

  console.log("Creating admin user...");
  await db.insert(schema.users).values({
    email: "admin@digitalhub.com",
    name: "Admin User",
    passwordHash: adminPasswordHash,
    phone: "+1 234 567 8900",
    address: "123 Admin St, Digital City, DC 12345",
    role: "admin",
  }).onConflictDoNothing();

  console.log("Creating regular user...");
  await db.insert(schema.users).values({
    email: "user@digitalhub.com",
    name: "Regular User",
    passwordHash: userPasswordHash,
    phone: "+1 234 567 8901",
    address: "456 User Ave, Digital Town, DT 67890",
    role: "user",
  }).onConflictDoNothing();

  console.log("Seeding categories...");
  const categoryData = [
    { name: "UI Kits", slug: "ui-kits", description: "Premium UI kits and design systems" },
    { name: "Templates", slug: "templates", description: "Website and application templates" },
    { name: "Plugins", slug: "plugins", description: "WordPress and other platform plugins" },
    { name: "AI Tools", slug: "ai-tools", description: "AI-powered tools and utilities" },
    { name: "Code Scripts", slug: "code-scripts", description: "Reusable code libraries and scripts" },
    { name: "Mobile Apps", slug: "mobile-apps", description: "Mobile application templates and kits" },
  ];
  for (const cat of categoryData) {
    await db.insert(schema.categories).values(cat).onConflictDoNothing();
  }

  console.log("Seeding announcements...");
  const announcementData = [
    {
      content: "🎉 New Year Sale - Up to 50% off on all digital products!",
      link: "/deals",
      type: "promo",
      isActive: true,
      priority: 10,
    },
    {
      content: "✨ Free shipping on orders over $50",
      type: "info",
      isActive: true,
      priority: 5,
    },
    {
      content: "🚀 Check out our new AI-powered tools collection!",
      link: "/categories/ai-tools",
      type: "info",
      isActive: true,
      priority: 5,
    },
  ];
  for (const ann of announcementData) {
    await db.insert(schema.announcements).values(ann).onConflictDoNothing();
  }

  console.log("Seeding products...");
  for (const product of sampleProducts) {
    await db.insert(schema.products).values(product).onConflictDoNothing();
  }

  console.log("Seeding deals...");
  const now = new Date();
  const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
  const dealData = [
    {
      title: "New Year Sale",
      description: "Start 2026 with amazing savings on all digital products! Get up to 50% off on all digital products including UI kits, templates, plugins, and more. This is our biggest sale of the year!",
      discountPercent: 50,
      code: "NEWYEAR50",
      startDate: now,
      endDate: futureDate,
      isActive: true,
    },
    {
      title: "Bundle Deals",
      description: "Purchase multiple products and get extra discounts! Buy 2 products and get 15% off, buy 3+ products and get 25% off! Mix and match any products from our marketplace.",
      discountPercent: 25,
      code: "BUNDLE25",
      startDate: now,
      endDate: futureDate,
      isActive: true,
    },
    {
      title: "First Purchase",
      description: "New to our marketplace? Get 10% off your first order! Welcome to our marketplace! Use the code WELCOME10 at checkout to get 10% off your first purchase. Valid on all products.",
      discountPercent: 10,
      code: "WELCOME10",
      startDate: now,
      endDate: futureDate,
      isActive: true,
    },
  ];
  for (const deal of dealData) {
    await db.insert(schema.deals).values(deal).onConflictDoNothing();
  }

  console.log("Seeding testimonials...");
  const testimonialData = [
    {
      name: "Sarah Johnson",
      role: "Product Designer",
      avatar: "/generated_images/Female_customer_testimonial_avatar_0a96e832.png",
      content: "The UI kits from DigitalHub saved me weeks of design work. The quality is outstanding and the components are so well organized.",
      rating: 5,
      isVerified: true,
      isVisible: true,
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      avatar: "/generated_images/Male_customer_testimonial_avatar_3deee3e5.png",
      content: "Best marketplace for developer tools. The code quality is excellent and everything is well documented. Highly recommended!",
      rating: 5,
      isVerified: true,
      isVisible: true,
    },
    {
      name: "Emma Davis",
      role: "Creative Director",
      avatar: "/generated_images/Young_female_testimonial_avatar_013dea30.png",
      content: "I've purchased multiple templates and they've all exceeded my expectations. The support is fantastic and the designs are modern and professional.",
      rating: 5,
      isVerified: true,
      isVisible: true,
    },
  ];
  for (const testimonial of testimonialData) {
    await db.insert(schema.testimonials).values(testimonial).onConflictDoNothing();
  }

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📧 Admin Credentials:");
  console.log("   Email: admin@digitalhub.com");
  console.log("   Password: admin123");
  console.log("\n👤 User Credentials:");
  console.log("   Email: user@digitalhub.com");
  console.log("   Password: user123\n");
}

seed().catch(console.error);
