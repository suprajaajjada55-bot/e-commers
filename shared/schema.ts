import { randomUUID } from "node:crypto";
import {
  mysqlTable,
  varchar,
  text,
  int,
  decimal,
  datetime,
  boolean,
  json,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const uuid = () => randomUUID();
const now = () => new Date();

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  passwordHash: text("password_hash"),
  phone: varchar("phone", { length: 64 }),
  address: text("address"),
  role: varchar("role", { length: 32 }).notNull().default("user"),
  avatar: text("avatar"),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
  updatedAt: datetime("updated_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  category: varchar("category", { length: 191 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image").notNull(),
  images: json("images").$type<string[] | null>(),
  author: varchar("author", { length: 191 }).notNull(),
  authorId: varchar("author_id", { length: 36 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  downloads: int("downloads").notNull().default(0),
  reviewCount: int("review_count").notNull().default(0),
  stockCount: int("stock_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  tags: json("tags").$type<string[] | null>(),
  licenseType: varchar("license_type", { length: 64 }).notNull(),
  downloadUrl: text("download_url"),
  fileSize: varchar("file_size", { length: 64 }),
  version: varchar("version", { length: 64 }),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const cartItems = mysqlTable("cart_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  userId: varchar("user_id", { length: 36 }).notNull(),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: int("quantity").notNull().default(1),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 64 }).notNull(),
  paymentIntentId: varchar("payment_intent_id", { length: 191 }),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  orderId: varchar("order_id", { length: 36 })
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  provider: varchar("provider", { length: 64 }).notNull().default("razorpay"),
  providerPaymentId: varchar("provider_payment_id", { length: 191 }),
  providerOrderId: varchar("provider_order_id", { length: 191 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 16 }).notNull().default("INR"),
  status: varchar("status", { length: 64 }).notNull().default("pending"),
  method: varchar("method", { length: 64 }),
  payload: json("payload").$type<Record<string, any> | null>(),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const orderItems = mysqlTable("order_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  orderId: varchar("order_id", { length: 36 })
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  licenseKey: varchar("license_key", { length: 191 }),
});

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  rating: int("rating").notNull(),
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const wishlist = mysqlTable("wishlist", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const loginEvents = mysqlTable("login_events", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  device: varchar("device", { length: 191 }),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const productRequests = mysqlTable("product_requests", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  productName: varchar("product_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const testimonials = mysqlTable("testimonials", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  name: varchar("name", { length: 191 }).notNull(),
  role: varchar("role", { length: 191 }),
  avatar: text("avatar"),
  rating: int("rating").notNull(),
  content: text("content").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const deals = mysqlTable("deals", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  discountPercent: int("discount_percent").notNull(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  startDate: datetime("start_date", { mode: "date" }).notNull(),
  endDate: datetime("end_date", { mode: "date" }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  productIds: json("product_ids").$type<string[] | null>(),
  categoryIds: json("category_ids").$type<string[] | null>(),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  name: varchar("name", { length: 191 }).notNull().unique(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const announcements = mysqlTable("announcements", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  content: text("content").notNull(),
  link: text("link"),
  type: varchar("type", { length: 32 }).notNull().default("info"),
  isActive: boolean("is_active").notNull().default(true),
  priority: int("priority").notNull().default(0),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
  updatedAt: datetime("updated_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(uuid),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: datetime("created_at", { mode: "date" }).notNull().$defaultFn(now),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const upsertUserSchema = insertUserSchema.partial({ createdAt: true, updatedAt: true });

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertCartItemSchema = createInsertSchema(cartItems);
export const selectCartItemSchema = createSelectSchema(cartItems);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertReviewSchema = createInsertSchema(reviews);
export const selectReviewSchema = createSelectSchema(reviews);

export const insertWishlistSchema = createInsertSchema(wishlist);
export const selectWishlistSchema = createSelectSchema(wishlist);

export const insertLoginEventSchema = createInsertSchema(loginEvents);
export const selectLoginEventSchema = createSelectSchema(loginEvents);

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers);
export const selectNewsletterSubscriberSchema = createSelectSchema(newsletterSubscribers);

export const insertProductRequestSchema = createInsertSchema(productRequests);
export const selectProductRequestSchema = createSelectSchema(productRequests);

export const insertTestimonialSchema = createInsertSchema(testimonials);
export const selectTestimonialSchema = createSelectSchema(testimonials);

export const insertDealSchema = createInsertSchema(deals);
export const selectDealSchema = createSelectSchema(deals);

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);

export const insertAnnouncementSchema = createInsertSchema(announcements);
export const selectAnnouncementSchema = createSelectSchema(announcements);

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);
export const selectPasswordResetTokenSchema = createSelectSchema(passwordResetTokens);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export type LoginEvent = typeof loginEvents.$inferSelect;
export type InsertLoginEvent = z.infer<typeof insertLoginEventSchema>;

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

export type ProductRequest = typeof productRequests.$inferSelect;
export type InsertProductRequest = z.infer<typeof insertProductRequestSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
