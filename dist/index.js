var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";
import cookieParser from "cookie-parser";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  announcements: () => announcements,
  cartItems: () => cartItems,
  categories: () => categories,
  deals: () => deals,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertDealSchema: () => insertDealSchema,
  insertLoginEventSchema: () => insertLoginEventSchema,
  insertNewsletterSubscriberSchema: () => insertNewsletterSubscriberSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPasswordResetTokenSchema: () => insertPasswordResetTokenSchema,
  insertProductRequestSchema: () => insertProductRequestSchema,
  insertProductSchema: () => insertProductSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertTestimonialSchema: () => insertTestimonialSchema,
  insertUserSchema: () => insertUserSchema,
  insertWishlistSchema: () => insertWishlistSchema,
  loginEvents: () => loginEvents,
  newsletterSubscribers: () => newsletterSubscribers,
  orderItems: () => orderItems,
  orders: () => orders,
  passwordResetTokens: () => passwordResetTokens,
  productRequests: () => productRequests,
  products: () => products,
  reviews: () => reviews,
  selectAnnouncementSchema: () => selectAnnouncementSchema,
  selectCartItemSchema: () => selectCartItemSchema,
  selectCategorySchema: () => selectCategorySchema,
  selectDealSchema: () => selectDealSchema,
  selectLoginEventSchema: () => selectLoginEventSchema,
  selectNewsletterSubscriberSchema: () => selectNewsletterSubscriberSchema,
  selectOrderItemSchema: () => selectOrderItemSchema,
  selectOrderSchema: () => selectOrderSchema,
  selectPasswordResetTokenSchema: () => selectPasswordResetTokenSchema,
  selectProductRequestSchema: () => selectProductRequestSchema,
  selectProductSchema: () => selectProductSchema,
  selectReviewSchema: () => selectReviewSchema,
  selectTestimonialSchema: () => selectTestimonialSchema,
  selectUserSchema: () => selectUserSchema,
  selectWishlistSchema: () => selectWishlistSchema,
  testimonials: () => testimonials,
  upsertUserSchema: () => upsertUserSchema,
  users: () => users,
  wishlist: () => wishlist
});
import { pgTable, text, varchar, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("user"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image").notNull(),
  images: text("images").array(),
  author: text("author").notNull(),
  authorId: varchar("author_id"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  downloads: integer("downloads").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  stockCount: integer("stock_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  tags: text("tags").array(),
  licenseType: text("license_type").notNull(),
  downloadUrl: text("download_url"),
  fileSize: text("file_size"),
  version: text("version"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  licenseKey: text("license_key")
});
var reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var wishlist = pgTable("wishlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var loginEvents = pgTable("login_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ip: text("ip"),
  userAgent: text("user_agent"),
  device: text("device"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var productRequests = pgTable("product_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  email: text("email").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role"),
  avatar: text("avatar"),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  code: text("code").notNull().unique(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  productIds: text("product_ids").array(),
  categoryIds: text("category_ids").array(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  link: text("link"),
  type: text("type").notNull().default("info"),
  // info, promo, warning
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users);
var selectUserSchema = createSelectSchema(users);
var upsertUserSchema = insertUserSchema.partial({ createdAt: true, updatedAt: true });
var insertProductSchema = createInsertSchema(products);
var selectProductSchema = createSelectSchema(products);
var insertCartItemSchema = createInsertSchema(cartItems);
var selectCartItemSchema = createSelectSchema(cartItems);
var insertOrderSchema = createInsertSchema(orders);
var selectOrderSchema = createSelectSchema(orders);
var insertOrderItemSchema = createInsertSchema(orderItems);
var selectOrderItemSchema = createSelectSchema(orderItems);
var insertReviewSchema = createInsertSchema(reviews);
var selectReviewSchema = createSelectSchema(reviews);
var insertWishlistSchema = createInsertSchema(wishlist);
var selectWishlistSchema = createSelectSchema(wishlist);
var insertLoginEventSchema = createInsertSchema(loginEvents);
var selectLoginEventSchema = createSelectSchema(loginEvents);
var insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers);
var selectNewsletterSubscriberSchema = createSelectSchema(newsletterSubscribers);
var insertProductRequestSchema = createInsertSchema(productRequests);
var selectProductRequestSchema = createSelectSchema(productRequests);
var insertTestimonialSchema = createInsertSchema(testimonials);
var selectTestimonialSchema = createSelectSchema(testimonials);
var insertDealSchema = createInsertSchema(deals);
var selectDealSchema = createSelectSchema(deals);
var insertCategorySchema = createInsertSchema(categories);
var selectCategorySchema = createSelectSchema(categories);
var insertAnnouncementSchema = createInsertSchema(announcements);
var selectAnnouncementSchema = createSelectSchema(announcements);
var insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);
var selectPasswordResetTokenSchema = createSelectSchema(passwordResetTokens);

// server/db.ts
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
var db = drizzle({
  connection: process.env.DATABASE_URL,
  ws,
  schema: schema_exports
});

// server/storage.ts
import { eq, and, desc, ilike, sql as sql2, lte, gte } from "drizzle-orm";
var DbStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserById(id) {
    return this.getUser(id);
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getAllProducts(filters) {
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }
    if (filters?.minPrice !== void 0) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice !== void 0) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }
    let query = db.select().from(products);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const products2 = await query;
    return products2;
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async getFeaturedProducts() {
    return await db.select().from(products).where(eq(products.isFeatured, true)).limit(8);
  }
  async searchProducts(query) {
    return await db.select().from(products).where(ilike(products.title, `%${query}%`)).limit(20);
  }
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async updateProduct(id, product) {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }
  async deleteProduct(id) {
    await db.delete(products).where(eq(products.id, id));
  }
  async getCartItems(userId) {
    const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId)).innerJoin(products, eq(cartItems.productId, products.id));
    return items.map((item) => ({
      ...item.cart_items,
      product: item.products
    }));
  }
  async getCartItemById(id) {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return item;
  }
  async addToCart(item) {
    const [cartItem] = await db.insert(cartItems).values(item).returning();
    return cartItem;
  }
  async updateCartItem(id, quantity) {
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated;
  }
  async removeFromCart(id) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }
  async clearCart(userId) {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
  async reduceStockForOrder(orderId) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      const [product] = await db.select({
        stockCount: products.stockCount
      }).from(products).where(eq(products.id, item.productId));
      if (!product) {
        continue;
      }
      const currentStock = product.stockCount ?? 0;
      const nextStock = Math.max(0, currentStock - item.quantity);
      await db.update(products).set({
        stockCount: nextStock,
        downloads: sql2`${products.downloads} + ${item.quantity}`
      }).where(eq(products.id, item.productId));
    }
  }
  async getUserProductReview(userId, productId) {
    const [review] = await db.select().from(reviews).where(and(
      eq(reviews.userId, userId),
      eq(reviews.productId, productId)
    )).orderBy(desc(reviews.createdAt)).limit(1);
    return review;
  }
  async hasUserPurchasedProduct(userId, productId) {
    const [row] = await db.select({
      orderId: orders.id
    }).from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders.id)).where(and(
      eq(orders.userId, userId),
      eq(orderItems.productId, productId),
      eq(orders.status, "completed")
    )).limit(1);
    return !!row;
  }
  async recalculateProductRating(productId) {
    const [stats] = await db.select({
      average: sql2`COALESCE(AVG(${reviews.rating}), 0)`,
      count: sql2`COUNT(${reviews.id})`
    }).from(reviews).where(eq(reviews.productId, productId));
    const averageRating = Number(stats?.average ?? 0);
    const reviewCount = Number(stats?.count ?? 0);
    await db.update(products).set({
      rating: reviewCount > 0 ? averageRating.toFixed(2) : "0",
      reviewCount
    }).where(eq(products.id, productId));
  }
  async getUserOrders(userId) {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }
  async getOrder(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  async getOrderByPaymentIntentId(paymentIntentId) {
    const [order] = await db.select().from(orders).where(eq(orders.paymentIntentId, paymentIntentId));
    return order;
  }
  async getOrderWithItems(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return void 0;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).innerJoin(products, eq(orderItems.productId, products.id));
    return {
      ...order,
      items: items.map((item) => ({
        ...item.order_items,
        product: item.products
      }))
    };
  }
  async createOrder(order) {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  async createOrderItem(item) {
    const [orderItem] = await db.insert(orderItems).values(item).returning();
    return orderItem;
  }
  async updateOrderStatus(id, status) {
    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return updated;
  }
  async getAllOrdersWithUsers() {
    const rows = await db.select().from(orders).innerJoin(users, eq(orders.userId, users.id)).orderBy(desc(orders.createdAt));
    return rows.map((row) => ({
      ...row.orders,
      user: row.users
    }));
  }
  async getUserOrdersWithItems(userId) {
    const orders2 = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    const results = [];
    for (const order of orders2) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).innerJoin(products, eq(orderItems.productId, products.id));
      results.push({
        ...order,
        items: items.map((item) => ({
          ...item.order_items,
          product: item.products
        }))
      });
    }
    return results;
  }
  async getProductReviews(productId) {
    const reviews2 = await db.select().from(reviews).where(eq(reviews.productId, productId)).innerJoin(users, eq(reviews.userId, users.id)).orderBy(desc(reviews.createdAt));
    return reviews2.map((review) => ({
      ...review.reviews,
      user: review.users
    }));
  }
  async createReview(review) {
    const [newReview] = await db.insert(reviews).values(review).returning();
    await this.recalculateProductRating(review.productId);
    return newReview;
  }
  async getWishlist(userId) {
    const items = await db.select().from(wishlist).where(eq(wishlist.userId, userId)).innerJoin(products, eq(wishlist.productId, products.id));
    return items.map((item) => ({
      ...item.wishlist,
      product: item.products
    }));
  }
  async getWishlistItemById(id) {
    const [item] = await db.select().from(wishlist).where(eq(wishlist.id, id));
    return item;
  }
  async addToWishlist(item) {
    const [wishlistItem] = await db.insert(wishlist).values(item).returning();
    return wishlistItem;
  }
  async removeFromWishlist(id) {
    await db.delete(wishlist).where(eq(wishlist.id, id));
  }
  async createLoginEvent(event) {
    const [loginEvent] = await db.insert(loginEvents).values(event).returning();
    return loginEvent;
  }
  async getLoginEvents(userId) {
    if (userId) {
      return await db.select().from(loginEvents).where(eq(loginEvents.userId, userId)).orderBy(desc(loginEvents.createdAt));
    }
    return await db.select().from(loginEvents).orderBy(desc(loginEvents.createdAt));
  }
  async getLoginAnalytics(days = 30) {
    const since = /* @__PURE__ */ new Date();
    since.setDate(since.getDate() - days);
    const events = await db.select().from(loginEvents).where(sql2`${loginEvents.createdAt} >= ${since}`);
    return {
      totalLogins: events.length,
      uniqueUsers: new Set(events.map((e) => e.userId)).size,
      byDate: events.reduce((acc, event) => {
        const date = event.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})
    };
  }
  async getLoginEventsDetailed() {
    const rows = await db.select().from(loginEvents).innerJoin(users, eq(loginEvents.userId, users.id)).orderBy(desc(loginEvents.createdAt));
    return rows.map((row) => ({
      ...row.login_events,
      user: row.users
    }));
  }
  async getNewsletterSubscribers() {
    return await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.isActive, true)).orderBy(desc(newsletterSubscribers.createdAt));
  }
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async addNewsletterSubscriber(email) {
    const [subscriber] = await db.insert(newsletterSubscribers).values({ email }).onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: { isActive: true }
    }).returning();
    return subscriber;
  }
  async removeNewsletterSubscriber(id) {
    await db.update(newsletterSubscribers).set({ isActive: false }).where(eq(newsletterSubscribers.id, id));
  }
  async getProductRequests(status) {
    if (status) {
      return await db.select().from(productRequests).where(eq(productRequests.status, status)).orderBy(desc(productRequests.createdAt));
    }
    return await db.select().from(productRequests).orderBy(desc(productRequests.createdAt));
  }
  async createProductRequest(request) {
    const [newRequest] = await db.insert(productRequests).values(request).returning();
    return newRequest;
  }
  async updateProductRequestStatus(id, status) {
    const [updated] = await db.update(productRequests).set({ status }).where(eq(productRequests.id, id)).returning();
    return updated;
  }
  async getTestimonials(visibleOnly = false) {
    if (visibleOnly) {
      return await db.select().from(testimonials).where(eq(testimonials.isVisible, true)).orderBy(desc(testimonials.createdAt));
    }
    return await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }
  async getTestimonial(id) {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial;
  }
  async createTestimonial(testimonial) {
    const [newTestimonial] = await db.insert(testimonials).values(testimonial).returning();
    return newTestimonial;
  }
  async updateTestimonial(id, testimonial) {
    const [updated] = await db.update(testimonials).set(testimonial).where(eq(testimonials.id, id)).returning();
    return updated;
  }
  async deleteTestimonial(id) {
    await db.delete(testimonials).where(eq(testimonials.id, id));
  }
  async getDeals(activeOnly = false) {
    if (activeOnly) {
      const now = /* @__PURE__ */ new Date();
      const allActiveDeals = await db.select().from(deals).where(eq(deals.isActive, true)).orderBy(desc(deals.createdAt));
      console.log(`Found ${allActiveDeals.length} active deals in database`);
      const filteredDeals = allActiveDeals.filter((deal) => {
        try {
          const startDate = deal.startDate instanceof Date ? deal.startDate : new Date(deal.startDate);
          const endDate = deal.endDate instanceof Date ? deal.endDate : new Date(deal.endDate);
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn(`Invalid dates for deal ${deal.id}:`, { startDate: deal.startDate, endDate: deal.endDate });
            return false;
          }
          const isValid = startDate <= now && endDate >= now;
          if (!isValid) {
            console.log(`Deal ${deal.id} (${deal.title}) is outside date range:`, {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              now: now.toISOString()
            });
          }
          return isValid;
        } catch (error) {
          console.error(`Error processing deal ${deal.id}:`, error);
          return false;
        }
      });
      console.log(`Returning ${filteredDeals.length} deals within date range`);
      return filteredDeals;
    }
    return await db.select().from(deals).orderBy(desc(deals.createdAt));
  }
  async getDeal(id) {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }
  async getDealByCode(code) {
    const now = /* @__PURE__ */ new Date();
    const [deal] = await db.select().from(deals).where(ilike(deals.code, code));
    if (!deal) return void 0;
    if (!deal.isActive) return void 0;
    const startDate = deal.startDate instanceof Date ? deal.startDate : new Date(deal.startDate);
    const endDate = deal.endDate instanceof Date ? deal.endDate : new Date(deal.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return void 0;
    }
    if (startDate <= now && endDate >= now) {
      return deal;
    }
    return void 0;
  }
  async createDeal(deal) {
    const [newDeal] = await db.insert(deals).values(deal).returning();
    return newDeal;
  }
  async updateDeal(id, deal) {
    const [updated] = await db.update(deals).set(deal).where(eq(deals.id, id)).returning();
    return updated;
  }
  async deleteDeal(id) {
    await db.delete(deals).where(eq(deals.id, id));
  }
  async getCategories() {
    return await db.select().from(categories).orderBy(categories.name);
  }
  async getCategoryBySlug(slug) {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  async getCategory(id) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  async createCategory(category) {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  async updateCategory(id, category) {
    const [updated] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updated;
  }
  async deleteCategory(id) {
    await db.delete(categories).where(eq(categories.id, id));
  }
  async getProductsByCategorySlug(slug) {
    const category = await this.getCategoryBySlug(slug);
    if (!category) return [];
    return await db.select().from(products).where(ilike(products.category, category.name));
  }
  async getAnnouncements(activeOnly = true) {
    if (activeOnly) {
      return await db.select().from(announcements).where(eq(announcements.isActive, true)).orderBy(desc(announcements.priority), desc(announcements.createdAt));
    }
    return await db.select().from(announcements).orderBy(desc(announcements.priority), desc(announcements.createdAt));
  }
  async getAnnouncement(id) {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }
  async createAnnouncement(announcement) {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }
  async updateAnnouncement(id, announcement) {
    const [updated] = await db.update(announcements).set({ ...announcement, updatedAt: /* @__PURE__ */ new Date() }).where(eq(announcements.id, id)).returning();
    return updated;
  }
  async deleteAnnouncement(id) {
    await db.delete(announcements).where(eq(announcements.id, id));
  }
  async getRecommendedProducts(userId, productId, limit = 8) {
    if (productId) {
      const product = await this.getProduct(productId);
      if (product) {
        const similar = await db.select().from(products).where(and(
          eq(products.category, product.category),
          sql2`${products.id} != ${productId}`
        )).limit(limit);
        if (similar.length >= limit) return similar;
      }
    }
    return await db.select().from(products).where(eq(products.isFeatured, true)).limit(limit);
  }
  async updateUser(id, user) {
    const [updated] = await db.update(users).set({ ...user, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return updated;
  }
  async createPasswordResetToken(token) {
    const [resetToken] = await db.insert(passwordResetTokens).values(token).returning();
    return resetToken;
  }
  async getPasswordResetToken(token) {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken;
  }
  async markPasswordResetTokenUsed(token) {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.token, token));
  }
};
var storage = new DbStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
var isDev = process.env.NODE_ENV === "development";
async function setupAuth(app2) {
  if (isDev) {
    console.log("\u26A0\uFE0F  Skipping Replit Auth (running in development mode)");
    return;
  }
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  const registeredStrategies = /* @__PURE__ */ new Set();
  const ensureStrategy = (domain) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  const isProduction = process.env.NODE_ENV === "production";
  return session({
    secret: process.env.SESSION_SECRET || "temporary_secret_for_dev",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: sessionTtl,
      sameSite: isProduction ? "none" : "lax"
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  const firstName = claims["first_name"] || "";
  const lastName = claims["last_name"] || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || void 0;
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    name: fullName,
    avatar: claims["profile_image_url"] || void 0
  });
}
var isAuthenticated = async (req, res, next) => {
  if (isDev) {
    return next();
  }
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// server/authUtils.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
var JWT_EXPIRES_IN = "7d";
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
var requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};
var requireAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: "Access denied" });
  }
};

// server/routes.ts
import { z } from "zod";

// server/middleware.ts
import rateLimit from "express-rate-limit";
var apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var searchRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 20,
  // Limit each IP to 20 search requests per minute
  message: "Too many search requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
};

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      if (!req.user || !req.user.claims) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/testimonials/feedback", apiRateLimiter, async (req, res) => {
    try {
      const bodySchema = z.object({
        rating: z.number().int().min(1).max(5),
        content: z.string().min(10).max(600),
        name: z.string().trim().min(1).max(80).optional(),
        role: z.string().trim().max(80).optional()
      });
      const { rating, content, name, role } = bodySchema.parse(req.body);
      const user = req.user;
      const testimonial = await storage.createTestimonial({
        name: name ?? user?.name ?? "Anonymous Customer",
        role: role ?? (user?.role === "admin" ? "Administrator" : "Customer"),
        avatar: user?.avatar ?? null,
        rating,
        content,
        isVerified: false,
        isVisible: true
      });
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      console.error("Error creating testimonial feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      const products2 = await storage.getAllProducts(
        category ? { category } : void 0
      );
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorDetails = process.env.NODE_ENV === "development" ? errorMessage : void 0;
      res.status(500).json({
        message: "Failed to fetch products",
        ...errorDetails && { error: errorDetails }
      });
    }
  });
  app2.get("/api/products/featured", async (req, res) => {
    try {
      const products2 = await storage.getFeaturedProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.get("/api/products/search/:query", async (req, res) => {
    try {
      const products2 = await storage.searchProducts(req.params.query);
      res.json(products2);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });
  app2.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const cartItems2 = await storage.getCartItems(userId);
      res.json(cartItems2);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  app2.post("/api/cart", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const bodySchema = z.object({
        productId: z.string(),
        quantity: z.number().int().positive().optional()
      });
      const validated = bodySchema.parse(req.body);
      const product = await storage.getProduct(validated.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if ((product.stockCount ?? 0) <= 0) {
        return res.status(400).json({ message: "Product is currently out of stock" });
      }
      const existingItems = await storage.getCartItems(userId);
      const existingItem = existingItems.find((item) => item.productId === validated.productId);
      if (existingItem) {
        const newQuantity = existingItem.quantity + (validated.quantity || 1);
        if (newQuantity > (product.stockCount ?? 0)) {
          return res.status(400).json({ message: "Requested quantity exceeds available stock" });
        }
        const updated = await storage.updateCartItem(existingItem.id, newQuantity);
        return res.json(updated);
      } else {
        const desiredQuantity = validated.quantity || 1;
        if (desiredQuantity > (product.stockCount ?? 0)) {
          return res.status(400).json({ message: "Requested quantity exceeds available stock" });
        }
        const cartItem = await storage.addToCart({
          userId,
          productId: validated.productId,
          quantity: desiredQuantity
        });
        return res.json(cartItem);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });
  app2.patch("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const bodySchema = z.object({
        quantity: z.number().int().positive()
      });
      const validated = bodySchema.parse(req.body);
      const existingItem = await storage.getCartItemById(req.params.id);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      const product = await storage.getProduct(existingItem.productId);
      if (product && validated.quantity > (product.stockCount ?? 0)) {
        return res.status(400).json({ message: "Requested quantity exceeds available stock" });
      }
      const cartItem = await storage.updateCartItem(req.params.id, validated.quantity);
      res.json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const existingItem = await storage.getCartItemById(req.params.id);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });
  app2.post("/api/cart/merge", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const bodySchema = z.object({
        items: z.array(z.object({
          productId: z.string(),
          quantity: z.number().int().positive()
        }))
      });
      const validated = bodySchema.parse(req.body);
      const existingCartItems = await storage.getCartItems(userId);
      for (const item of validated.items) {
        const product = await storage.getProduct(item.productId);
        if (!product || (product.stockCount ?? 0) <= 0) {
          continue;
        }
        const existingItem = existingCartItems.find((ci) => ci.productId === item.productId);
        const available = Math.max(0, (product.stockCount ?? 0) - (existingItem?.quantity ?? 0));
        if (available <= 0) {
          continue;
        }
        const quantityToAdd = Math.min(available, item.quantity);
        if (quantityToAdd <= 0) {
          continue;
        }
        if (existingItem) {
          await storage.updateCartItem(existingItem.id, existingItem.quantity + quantityToAdd);
          existingItem.quantity += quantityToAdd;
        } else {
          const created = await storage.addToCart({
            userId,
            productId: item.productId,
            quantity: quantityToAdd
          });
          existingCartItems.push({
            ...created,
            product
          });
        }
      }
      const updatedCart = await storage.getCartItems(userId);
      res.json(updatedCart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error merging cart:", error);
      res.status(500).json({ message: "Failed to merge cart" });
    }
  });
  app2.post("/api/cart/guest", async (req, res) => {
    try {
      const bodySchema = z.object({
        items: z.array(z.object({
          productId: z.string(),
          quantity: z.number().int().positive()
        }))
      });
      const validated = bodySchema.parse(req.body);
      res.json({ items: validated.items, message: "Guest cart saved" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process guest cart" });
    }
  });
  app2.get("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlist2 = await storage.getWishlist(userId);
      res.json(wishlist2);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });
  app2.post("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const bodySchema = z.object({
        productId: z.string()
      });
      const validated = bodySchema.parse(req.body);
      const wishlistItem = await storage.addToWishlist({
        userId,
        productId: validated.productId
      });
      res.json(wishlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });
  app2.delete("/api/wishlist/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingItem = await storage.getWishlistItemById(req.params.id);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      await storage.removeFromWishlist(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });
  app2.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews2 = await storage.getProductReviews(req.params.id);
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.post("/api/products/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const bodySchema = z.object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional()
      });
      const validated = bodySchema.parse(req.body);
      const productId = req.params.id;
      const hasPurchased = await storage.hasUserPurchasedProduct(userId, productId);
      const review = await storage.createReview({
        productId,
        userId,
        rating: validated.rating,
        comment: validated.comment,
        isVerifiedPurchase: hasPurchased
      });
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  app2.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const orders2 = await storage.getUserOrders(userId);
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const order = await storage.getOrderWithItems(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const itemsWithReviews = await Promise.all(
        order.items.map(async (item) => {
          const review = await storage.getUserProductReview(userId, item.productId);
          return {
            ...item,
            userReview: review ?? null
          };
        })
      );
      res.json({
        ...order,
        items: itemsWithReviews
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  app2.get("/api/announcements", async (req, res) => {
    try {
      const announcements2 = await storage.getAnnouncements(true);
      res.json(announcements2);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });
  app2.get("/api/search", searchRateLimiter, async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || query.length < 2) {
        return res.json({ results: [] });
      }
      const priceMatch = query.match(/(?:under|below|less than|max|upto|up to)\s*[₹$]?(\d+)/i);
      const categoryHints = ["ui kit", "template", "plugin", "ai tool", "code script", "mobile app"];
      const detectedCategory = categoryHints.find((cat) => query.toLowerCase().includes(cat));
      let products2 = await storage.searchProducts(query);
      if (priceMatch) {
        const maxPrice = parseFloat(priceMatch[1]);
        products2 = products2.filter((p) => parseFloat(p.price) <= maxPrice);
      }
      if (detectedCategory) {
        products2 = products2.filter(
          (p) => p.category.toLowerCase().includes(detectedCategory) || p.title.toLowerCase().includes(detectedCategory)
        );
      }
      const results = products2.slice(0, 10).map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: `$${Number(p.price).toFixed(2)}`,
        image: p.image
      }));
      res.json({ results });
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      const allProducts = await storage.getAllProducts();
      const categoriesWithCounts = await Promise.all(
        categories2.map(async (cat) => {
          const products2 = allProducts.filter(
            (p) => p.category && p.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
          );
          return { ...cat, productCount: products2.length };
        })
      );
      res.json(categoriesWithCounts);
    } catch (error) {
      console.error("Error fetching categories:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorDetails = process.env.NODE_ENV === "development" ? errorMessage : void 0;
      res.status(500).json({
        message: "Failed to fetch categories",
        ...errorDetails && { error: errorDetails }
      });
    }
  });
  app2.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const products2 = await storage.getProductsByCategorySlug(req.params.slug);
      res.json({ category, products: products2 });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  app2.get("/api/recommendations", async (req, res) => {
    try {
      const userId = req.user?.userId;
      const productId = req.query.productId;
      const limit = req.query.limit ? parseInt(req.query.limit) : 8;
      const recommendations = await storage.getRecommendedProducts(userId, productId, limit);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });
  app2.post("/api/chat", apiRateLimiter, async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      const lowerMessage = message.toLowerCase();
      let response = "I can help you with:\n- Finding products\n- Order tracking\n- Product information\n- General questions";
      if (lowerMessage.includes("order") || lowerMessage.includes("purchase") || lowerMessage.includes("track")) {
        response = "To track your order, please log in and visit the Orders section. If you need help with a specific order, please contact our support team.";
      } else if (lowerMessage.includes("product") || lowerMessage.includes("item") || lowerMessage.includes("find")) {
        response = "You can browse our products by category or use the search bar. What type of product are you looking for?";
      } else if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("discount")) {
        response = "Product prices are displayed on each product page. We also have special deals and discounts - check out the Deals page!";
      } else if (lowerMessage.includes("payment") || lowerMessage.includes("pay") || lowerMessage.includes("razorpay")) {
        response = "We accept payments through Razorpay. All transactions are secure and encrypted.";
      } else if (lowerMessage.includes("category") || lowerMessage.includes("categories")) {
        response = "We have several categories: UI Kits, Templates, Plugins, AI Tools, Code Scripts, and Mobile Apps. Browse by category to find what you need!";
      } else if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
        response = "I can help you with product searches, order information, and general questions. You can also contact our support team through the Contact page.";
      }
      res.json({ response });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });
  app2.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials2 = await storage.getTestimonials(true);
      res.json(testimonials2);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });
  app2.get("/api/deals", async (req, res) => {
    try {
      const allDeals = await storage.getDeals(false);
      console.log(`Total deals in database: ${allDeals.length}`);
      const activeDeals = await storage.getDeals(true);
      console.log(`Active deals within date range: ${activeDeals.length}`);
      if (allDeals.length > 0) {
        console.log("All deals:", allDeals.map((d) => ({
          id: d.id,
          title: d.title,
          isActive: d.isActive,
          startDate: d.startDate,
          endDate: d.endDate,
          code: d.code
        })));
      }
      res.json(activeDeals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });
  app2.post("/api/coupon/validate", async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const { code } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Coupon code is required" });
      }
      const normalizedCode = code.trim().toUpperCase();
      console.log("Validating coupon code:", normalizedCode);
      const deal = await storage.getDealByCode(normalizedCode);
      if (!deal) {
        console.log("Coupon not found or invalid:", normalizedCode);
        return res.status(404).json({
          message: "Invalid or expired coupon code",
          valid: false
        });
      }
      console.log("Coupon validated successfully:", deal.code, deal.title);
      return res.json({
        valid: true,
        deal: {
          id: deal.id,
          code: deal.code,
          title: deal.title,
          discountPercent: deal.discountPercent,
          description: deal.description
        }
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      return res.status(500).json({ message: "Failed to validate coupon", error: error.message });
    }
  });
  app2.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const bodySchema = z.object({
        email: z.string().email()
      });
      const validated = bodySchema.parse(req.body);
      await storage.addNewsletterSubscriber(validated.email);
      res.json({
        success: true,
        message: "Successfully subscribed to newsletter!",
        couponCode: "WELCOME10"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address", errors: error.errors });
      }
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });
  app2.post("/api/product-requests", async (req, res) => {
    try {
      const bodySchema = z.object({
        productName: z.string().min(1),
        email: z.string().email(),
        message: z.string().optional()
      });
      const validated = bodySchema.parse(req.body);
      await storage.createProductRequest({
        productName: validated.productName,
        email: validated.email,
        message: validated.message
      });
      res.json({
        success: true,
        message: "Thank you for your request! We'll review it and get back to you soon."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error submitting product request:", error);
      res.status(500).json({ message: "Failed to submit product request" });
    }
  });
  app2.get("/api/home-slides", async (req, res) => {
    try {
      const slides = [
        {
          id: 1,
          title: "Premium Digital Products",
          subtitle: "2026 Collection",
          description: "Discover cutting-edge digital solutions for your business",
          ctaText: "Explore Now",
          ctaLink: "/products",
          imageUrl: "/attached_assets/stock_images/modern_digital_marke_8c277cbd.jpg",
          backgroundColor: "#f97316",
          highlights: [
            "Exclusive access to premium digital templates and tools",
            "Handpicked resources for professionals and creators",
            "Seamless downloads with secure payment options"
          ]
        },
        {
          id: 2,
          title: "New Year Sale",
          subtitle: "Up to 50% Off",
          description: "Limited time offer on all categories",
          ctaText: "Shop Deals",
          ctaLink: "/deals",
          imageUrl: "/attached_assets/stock_images/digital_products_sof_b692c7cf.jpg",
          backgroundColor: "#8b5cf6",
          highlights: [
            "Save big on top-rated digital assets and software",
            "Exclusive bundles for developers and designers",
            "Unlock 50% discounts before the sale ends!"
          ]
        },
        {
          id: 3,
          title: "AI-Powered Tools",
          subtitle: "Future of Work",
          description: "Transform your workflow with intelligent solutions",
          ctaText: "Learn More",
          ctaLink: "/categories",
          imageUrl: "/attached_assets/stock_images/digital_products_sof_45914c21.jpg",
          backgroundColor: "#3b82f6",
          highlights: [
            "Boost productivity using AI automation and analytics",
            "Smart design and coding tools for faster projects",
            "Revolutionize your business with intelligent software"
          ]
        }
      ];
      res.json(slides);
    } catch (error) {
      console.error("Error fetching home slides:", error);
      res.status(500).json({ message: "Failed to fetch home slides" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/authRoutes.ts
import { z as z2 } from "zod";

// server/email.ts
import { createTransport } from "nodemailer";
var transporter = createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  // true for 465, false for other ports
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : void 0
});
async function verifyTransporter() {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("\u26A0\uFE0F  Email transporter: No SMTP credentials configured, email functionality disabled");
      return false;
    }
    await transporter.verify();
    console.log("\u2705 Email transporter verified successfully");
    return true;
  } catch (error) {
    console.error("\u274C Email transporter verification failed:", error);
    return false;
  }
}
async function sendPasswordResetEmail(email, resetLink, userName = "User") {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("\u26A0\uFE0F  Email not configured - password reset email not sent");
    return false;
  }
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Your Store"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #ff6b35; }
            .content { margin-bottom: 30px; }
            .button { display: inline-block; background-color: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${process.env.SMTP_FROM_NAME || "Your Store"}</div>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi ${userName},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Your Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #ff6b35;">${resetLink}</p>
              
              <div class="warning">
                <strong>Important:</strong>
                <ul>
                  <li>This link expires in 1 hour for security reasons</li>
                  <li>If you didn't request this password reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${process.env.SMTP_FROM_NAME || "Your Store"}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${userName},

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

Important:
- This link expires in 1 hour for security reasons
- If you didn't request this password reset, please ignore this email
- Never share this link with anyone

This is an automated message. Please do not reply to this email.

\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${process.env.SMTP_FROM_NAME || "Your Store"}
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("\u2705 Password reset email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("\u274C Failed to send password reset email:", error);
    return false;
  }
}
async function sendWelcomeEmail(email, userName = "User") {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("\u26A0\uFE0F  Email not configured - welcome email not sent");
    return false;
  }
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Your Store"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to Our Store!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #ff6b35; }
            .content { margin-bottom: 30px; }
            .button { display: inline-block; background-color: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${process.env.SMTP_FROM_NAME || "Your Store"}</div>
            </div>
            
            <div class="content">
              <h2>Welcome, ${userName}!</h2>
              <p>Thank you for creating an account with us. We're excited to have you as part of our community!</p>
              <p>Start exploring our amazing products and enjoy your shopping experience.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL || "http://localhost:5000"}" class="button">Start Shopping</a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
              <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${process.env.SMTP_FROM_NAME || "Your Store"}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome, ${userName}!

Thank you for creating an account with us. We're excited to have you as part of our community!

Start exploring our amazing products and enjoy your shopping experience.

Visit us at: ${process.env.CLIENT_URL || "http://localhost:5000"}

\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${process.env.SMTP_FROM_NAME || "Your Store"}
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("\u2705 Welcome email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("\u274C Failed to send welcome email:", error);
    return false;
  }
}

// server/authRoutes.ts
var signupSchema = z2.object({
  email: z2.string().email("Invalid email address"),
  password: z2.string().min(6, "Password must be at least 6 characters"),
  name: z2.string().min(2, "Name must be at least 2 characters"),
  phone: z2.string().optional(),
  address: z2.string().optional()
});
var loginSchema = z2.object({
  email: z2.string().email("Invalid email address"),
  password: z2.string().min(1, "Password is required")
});
function registerAuthRoutes(app2) {
  app2.post("/api/auth/signup", authRateLimiter, async (req, res) => {
    try {
      const validated = signupSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validated.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const passwordHash = await hashPassword(validated.password);
      const user = await storage.createUser({
        email: validated.email,
        name: validated.name,
        passwordHash,
        phone: validated.phone || null,
        address: validated.address || null,
        role: "user"
      });
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      if (user.name) {
        sendWelcomeEmail(user.email, user.name).catch((error) => {
          console.error("Failed to send welcome email:", error);
        });
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
  app2.post("/api/auth/login", authRateLimiter, async (req, res) => {
    try {
      const validated = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(validated.email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isValid = await comparePassword(validated.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      await storage.createLoginEvent({
        userId: user.id,
        ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        device: req.headers["user-agent"]?.includes("Mobile") ? "mobile" : "desktop"
      });
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      await storage.clearCart(userId);
      res.clearCookie("token");
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.clearCookie("token");
      res.json({ message: "Logged out successfully" });
    }
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const fullUser = await storage.getUserById(user.userId);
      if (!fullUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        user: {
          id: fullUser.id,
          email: fullUser.email,
          name: fullUser.name,
          phone: fullUser.phone,
          address: fullUser.address,
          role: fullUser.role
        }
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  app2.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const updateSchema = z2.object({
        name: z2.string().min(2).optional(),
        phone: z2.string().optional(),
        address: z2.string().optional()
      });
      const validated = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(userId, validated);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          address: updatedUser.address,
          role: updatedUser.role
        }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If the email exists, a password reset link has been sent." });
      }
      const crypto2 = await import("crypto");
      const token = crypto2.randomBytes(32).toString("hex");
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt
      });
      const resetLink = `${process.env.CLIENT_URL || "http://localhost:5000"}/auth?mode=reset&token=${token}`;
      const emailSent = await sendPasswordResetEmail(email, resetLink, user.name || void 0);
      if (!emailSent) {
        console.error("Failed to send password reset email");
      }
      res.json({
        message: "Password reset link sent to your email"
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken || resetToken.used || /* @__PURE__ */ new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      const passwordHash = await hashPassword(password);
      await storage.updateUser(resetToken.userId, { passwordHash });
      await storage.markPasswordResetTokenUsed(token);
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
}

// server/adminRoutes.ts
import { z as z3 } from "zod";

// server/upload.ts
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var productsDir = path.join(__dirname, "../client/public/products");
var assetsDir = path.join(__dirname, "../attached_assets/products");
[productsDir, assetsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
var productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});
var assetStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assetsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `asset-${uniqueSuffix}${ext}`);
  }
});
var fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
  }
};
var uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter
});
var uploadAsset = multer({
  storage: assetStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB limit
  fileFilter
});
function getImageUrl(filename, type = "product") {
  if (type === "product") {
    return `/products/${filename}`;
  }
  return `/attached_assets/products/${filename}`;
}

// server/adminRoutes.ts
function registerAdminRoutes(app2) {
  app2.post("/api/admin/upload", requireAuth, requireAdmin, uploadProductImage.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const imageUrl = getImageUrl(req.file.filename, "product");
      res.json({ url: imageUrl, filename: req.file.filename });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  app2.get("/api/admin/orders", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const orders2 = await storage.getAllOrdersWithUsers();
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/admin/users/:id/orders", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const orders2 = await storage.getUserOrdersWithItems(userId);
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching user orders for admin:", error);
      res.status(500).json({ message: "Failed to fetch user orders" });
    }
  });
  app2.get("/api/admin/logins", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const events = await storage.getLoginEventsDetailed();
      res.json(events);
    } catch (error) {
      console.error("Error fetching login events:", error);
      res.status(500).json({ message: "Failed to fetch login events" });
    }
  });
  app2.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/admin/products", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.json(product);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.patch("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log(`[PRODUCT UPDATE] Updating product ${req.params.id}`);
      console.log(`[PRODUCT UPDATE] Request body:`, JSON.stringify(req.body, null, 2));
      const existingProduct = await storage.getProduct(req.params.id);
      if (!existingProduct) {
        console.log(`[PRODUCT UPDATE] Product not found: ${req.params.id}`);
        return res.status(404).json({ message: "Product not found" });
      }
      const body = { ...req.body };
      Object.keys(body).forEach((key) => {
        if (body[key] === void 0 || body[key] === null || body[key] === "") {
          const requiredFields = ["title", "description", "category", "price", "image", "author", "licenseType"];
          if (!requiredFields.includes(key)) {
            delete body[key];
          }
        }
      });
      if (body.price !== void 0) {
        body.price = String(body.price);
      }
      if (body.rating !== void 0) {
        body.rating = String(body.rating);
      }
      console.log(`[PRODUCT UPDATE] Cleaned body:`, JSON.stringify(body, null, 2));
      const validated = insertProductSchema.partial().parse(body);
      console.log(`[PRODUCT UPDATE] Validated data:`, JSON.stringify(validated, null, 2));
      const updatedProduct = await storage.updateProduct(req.params.id, validated);
      if (!updatedProduct) {
        console.log(`[PRODUCT UPDATE] Update returned null for product: ${req.params.id}`);
        return res.status(404).json({ message: "Product not found" });
      }
      console.log(`[PRODUCT UPDATE] Successfully updated product:`, updatedProduct.id);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        console.error("[PRODUCT UPDATE] Validation error details:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[PRODUCT UPDATE] Error updating product:", error);
      console.error("[PRODUCT UPDATE] Error type:", error?.constructor?.name);
      console.error("[PRODUCT UPDATE] Error message:", error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        console.error("[PRODUCT UPDATE] Error stack:", error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorDetails = process.env.NODE_ENV === "development" ? {
        message: errorMessage,
        ...error instanceof Error && error.stack && { stack: error.stack }
      } : void 0;
      res.status(500).json({
        message: "Failed to update product",
        ...errorDetails && { error: errorDetails }
      });
    }
  });
  app2.delete("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorDetails = process.env.NODE_ENV === "development" ? errorMessage : void 0;
      res.status(500).json({
        message: "Failed to delete product",
        ...errorDetails && { error: errorDetails }
      });
    }
  });
  app2.get("/api/admin/deals", requireAuth, requireAdmin, async (req, res) => {
    try {
      const deals2 = await storage.getDeals();
      res.json(deals2);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });
  app2.post("/api/admin/deals", requireAuth, requireAdmin, async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.startDate) {
        if (typeof body.startDate === "string") {
          const date = new Date(body.startDate);
          if (isNaN(date.getTime())) {
            return res.status(400).json({ message: "Invalid startDate format" });
          }
          body.startDate = date;
        }
      }
      if (body.endDate) {
        if (typeof body.endDate === "string") {
          const date = new Date(body.endDate);
          if (isNaN(date.getTime())) {
            return res.status(400).json({ message: "Invalid endDate format" });
          }
          body.endDate = date;
        }
      }
      const validated = insertDealSchema.parse(body);
      const deal = await storage.createDeal(validated);
      res.json(deal);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        console.error("Validation error details:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating deal:", error);
      res.status(500).json({ message: "Failed to create deal" });
    }
  });
  app2.patch("/api/admin/deals/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log(`[DEAL UPDATE] Updating deal ${req.params.id}`);
      console.log(`[DEAL UPDATE] Request body:`, JSON.stringify(req.body, null, 2));
      const existingDeal = await storage.getDeal(req.params.id);
      if (!existingDeal) {
        console.log(`[DEAL UPDATE] Deal not found: ${req.params.id}`);
        return res.status(404).json({ message: "Deal not found" });
      }
      console.log(`[DEAL UPDATE] Existing deal:`, JSON.stringify(existingDeal, null, 2));
      const body = { ...req.body };
      delete body.id;
      delete body.createdAt;
      if (body.code && body.code !== existingDeal.code) {
        console.log(`[DEAL UPDATE] Checking code conflict: ${body.code}`);
        const dealWithCode = await storage.getDealByCode(body.code);
        if (dealWithCode && dealWithCode.id !== req.params.id) {
          console.log(`[DEAL UPDATE] Code conflict found with deal: ${dealWithCode.id}`);
          return res.status(400).json({ message: "A deal with this code already exists" });
        }
      }
      if (body.startDate) {
        if (typeof body.startDate === "string") {
          const date = new Date(body.startDate);
          if (isNaN(date.getTime())) {
            console.log(`[DEAL UPDATE] Invalid startDate: ${body.startDate}`);
            return res.status(400).json({ message: "Invalid startDate format" });
          }
          body.startDate = date;
          console.log(`[DEAL UPDATE] Parsed startDate:`, date);
        }
      }
      if (body.endDate) {
        if (typeof body.endDate === "string") {
          const date = new Date(body.endDate);
          if (isNaN(date.getTime())) {
            console.log(`[DEAL UPDATE] Invalid endDate: ${body.endDate}`);
            return res.status(400).json({ message: "Invalid endDate format" });
          }
          body.endDate = date;
          console.log(`[DEAL UPDATE] Parsed endDate:`, date);
        }
      }
      console.log(`[DEAL UPDATE] Body after processing:`, JSON.stringify(body, null, 2));
      const validated = insertDealSchema.partial().parse(body);
      console.log(`[DEAL UPDATE] Validated data:`, JSON.stringify(validated, null, 2));
      const deal = await storage.updateDeal(req.params.id, validated);
      if (!deal) {
        console.log(`[DEAL UPDATE] Update returned null for deal: ${req.params.id}`);
        return res.status(404).json({ message: "Deal not found" });
      }
      console.log(`[DEAL UPDATE] Successfully updated deal:`, deal.id);
      res.json(deal);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        console.error("[DEAL UPDATE] Validation error details:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("[DEAL UPDATE] Error updating deal:", error);
      console.error("[DEAL UPDATE] Error type:", error?.constructor?.name);
      console.error("[DEAL UPDATE] Error message:", error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        console.error("[DEAL UPDATE] Error stack:", error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : void 0;
      if (errorMessage.includes("unique") || errorMessage.includes("duplicate") || errorMessage.includes("violates unique constraint")) {
        return res.status(400).json({
          message: "A deal with this code already exists",
          error: process.env.NODE_ENV === "development" ? errorMessage : void 0
        });
      }
      const errorDetails = process.env.NODE_ENV === "development" ? {
        message: errorMessage,
        ...errorStack && { stack: errorStack }
      } : void 0;
      res.status(500).json({
        message: "Failed to update deal",
        ...errorDetails && { error: errorDetails }
      });
    }
  });
  app2.delete("/api/admin/deals/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteDeal(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting deal:", error);
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });
  app2.get("/api/admin/testimonials", requireAuth, requireAdmin, async (req, res) => {
    try {
      const testimonials2 = await storage.getTestimonials();
      res.json(testimonials2);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });
  app2.post("/api/admin/testimonials", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validated);
      res.json(testimonial);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating testimonial:", error);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });
  app2.patch("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertTestimonialSchema.partial().parse(req.body);
      const testimonial = await storage.updateTestimonial(req.params.id, validated);
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating testimonial:", error);
      res.status(500).json({ message: "Failed to update testimonial" });
    }
  });
  app2.delete("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteTestimonial(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });
  app2.get("/api/admin/analytics/logins", requireAuth, requireAdmin, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 30;
      const analytics = await storage.getLoginAnalytics(days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching login analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/admin/newsletter-subscribers", requireAuth, requireAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });
  app2.get("/api/admin/product-requests", requireAuth, requireAdmin, async (req, res) => {
    try {
      const status = req.query.status;
      const requests = await storage.getProductRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching product requests:", error);
      res.status(500).json({ message: "Failed to fetch product requests" });
    }
  });
  app2.patch("/api/admin/product-requests/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const request = await storage.updateProductRequestStatus(req.params.id, status);
      if (!request) {
        return res.status(404).json({ message: "Product request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error updating product request:", error);
      res.status(500).json({ message: "Failed to update product request" });
    }
  });
  app2.get("/api/admin/categories", requireAuth, requireAdmin, async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.post("/api/admin/categories", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validated);
      res.json(category);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  app2.patch("/api/admin/categories/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, validated);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/admin/categories/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.get("/api/admin/announcements", requireAuth, requireAdmin, async (req, res) => {
    try {
      const announcements2 = await storage.getAnnouncements(false);
      res.json(announcements2);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });
  app2.post("/api/admin/announcements", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validated);
      res.json(announcement);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });
  app2.patch("/api/admin/announcements/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(req.params.id, validated);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });
  app2.delete("/api/admin/announcements/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteAnnouncement(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });
}

// server/paymentRoutes.ts
import Razorpay from "razorpay";
import crypto from "crypto";
var razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
var razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
var razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
var razorpay = null;
if (razorpayKeyId && razorpayKeySecret) {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
  });
  console.log("\u2705 Razorpay initialized successfully");
} else {
  console.warn("\u26A0\uFE0F  Razorpay credentials not configured. Payment routes will return 503.");
}
function registerPaymentRoutes(app2) {
  app2.post("/api/orders/create", requireAuth, async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(503).json({ message: "Payment gateway not configured" });
      }
      const userId = req.user.userId;
      const cartItems2 = await storage.getCartItems(userId);
      if (!cartItems2 || cartItems2.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const outOfStockItem = cartItems2.find(
        (item) => (item.product.stockCount ?? 0) < item.quantity
      );
      if (outOfStockItem) {
        return res.status(400).json({
          message: `${outOfStockItem.product.title} is currently out of stock`
        });
      }
      const totalAmount = cartItems2.reduce((sum, item) => {
        return sum + parseFloat(item.product.price) * item.quantity;
      }, 0);
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `order_${Date.now()}`,
        notes: {
          userId
        }
      });
      const order = await storage.createOrder({
        userId,
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
        paymentIntentId: razorpayOrder.id
      });
      for (const item of cartItems2) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          price: item.product.price,
          quantity: item.quantity
        });
      }
      res.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayKeyId,
        internalOrderId: order.id
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.post("/api/payments/verify", requireAuth, async (req, res) => {
    try {
      if (!razorpay || !razorpayKeySecret) {
        return res.status(503).json({ message: "Payment gateway not configured" });
      }
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac("sha256", razorpayKeySecret).update(body.toString()).digest("hex");
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
      const order = await storage.getOrderByPaymentIntentId(razorpay_order_id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.status === "completed") {
        return res.json({
          success: true,
          message: "Payment already verified",
          orderId: order.id
        });
      }
      await storage.updateOrderStatus(order.id, "completed");
      await storage.reduceStockForOrder(order.id);
      await storage.clearCart(req.user.userId);
      res.json({
        success: true,
        message: "Payment verified successfully",
        orderId: order.id
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Payment verification failed" });
    }
  });
  app2.post("/api/webhooks/razorpay", async (req, res) => {
    try {
      if (!razorpay || !razorpayWebhookSecret) {
        return res.status(503).json({ message: "Payment gateway not configured" });
      }
      const webhookSignature = req.headers["x-razorpay-signature"];
      if (!webhookSignature) {
        return res.status(400).json({ message: "Missing signature" });
      }
      const expectedSignature = crypto.createHmac("sha256", razorpayWebhookSecret).update(JSON.stringify(req.body)).digest("hex");
      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }
      const event = req.body;
      if (event.event === "payment.captured") {
        const paymentId = event.payload.payment.entity.id;
        const orderId = event.payload.payment.entity.order_id;
        const order = await storage.getOrderByPaymentIntentId(orderId);
        if (order && order.status !== "completed") {
          await storage.updateOrderStatus(order.id, "completed");
          await storage.reduceStockForOrder(order.id);
          console.log(`\u2705 Order ${order.id} marked as completed via webhook`);
        }
      } else if (event.event === "payment.failed") {
        const orderId = event.payload.payment.entity.order_id;
        const order = await storage.getOrderByPaymentIntentId(orderId);
        if (order) {
          await storage.updateOrderStatus(order.id, "failed");
          console.log(`\u274C Order ${order.id} marked as failed via webhook`);
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });
}

// server/sitemap.ts
function registerSitemapRoutes(app2) {
  app2.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = process.env.BASE_URL || `http://${req.get("host")}`;
      const products2 = await storage.getAllProducts();
      const categories2 = await storage.getCategories();
      const urls = [
        { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0" },
        { loc: `${baseUrl}/products`, changefreq: "daily", priority: "0.9" },
        { loc: `${baseUrl}/deals`, changefreq: "daily", priority: "0.8" },
        { loc: `${baseUrl}/categories`, changefreq: "weekly", priority: "0.8" },
        { loc: `${baseUrl}/about`, changefreq: "monthly", priority: "0.7" },
        { loc: `${baseUrl}/contact`, changefreq: "monthly", priority: "0.6" },
        ...categories2.map((cat) => ({
          loc: `${baseUrl}/categories/${cat.slug}`,
          changefreq: "weekly",
          priority: "0.7"
        })),
        ...products2.map((product) => ({
          loc: `${baseUrl}/products/${product.id}`,
          changefreq: "weekly",
          priority: "0.6"
        }))
      ];
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
      res.setHeader("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });
  app2.get("/robots.txt", (req, res) => {
    const baseUrl = process.env.BASE_URL || `http://${req.get("host")}`;
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;
    res.setHeader("Content-Type", "text/plain");
    res.send(robots);
  });
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    vite.middlewares(req, res, next);
  });
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(securityHeaders);
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await verifyTransporter();
  registerAuthRoutes(app);
  registerAdminRoutes(app);
  registerPaymentRoutes(app);
  registerSitemapRoutes(app);
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "localhost", () => {
    log(`\u2705 Server running on http://localhost:${port}`);
  });
})();
