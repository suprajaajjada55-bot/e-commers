import { randomUUID } from "node:crypto";
import { db } from "./db";
import { eq, and, desc, like, sql, ne, lte, gte } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User, InsertUser, UpsertUser,
  Product, InsertProduct,
  CartItem, InsertCartItem,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  Review, InsertReview,
  Wishlist, InsertWishlist,
  LoginEvent, InsertLoginEvent,
  NewsletterSubscriber, InsertNewsletterSubscriber,
  ProductRequest, InsertProductRequest,
  Testimonial, InsertTestimonial,
  Deal, InsertDeal,
  Category, InsertCategory,
  Announcement, InsertAnnouncement,
  PasswordResetToken, InsertPasswordResetToken
  ,
  Payment, InsertPayment
} from "@shared/schema";

const ensureId = <T extends { id?: string }>(entity: T): T & { id: string } => ({
  ...entity,
  id: entity.id ?? randomUUID(),
});

const selectById = async <TRow>(table: any, id: string): Promise<TRow | undefined> => {
  const [row] = await db.select().from(table).where(eq(table.id, id));
  return row as TRow | undefined;
};

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getAllProducts(filters?: { category?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  getCartItemById(id: string): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  reduceStockForOrder(orderId: string): Promise<void>;
  getUserProductReview(userId: string, productId: string): Promise<Review | undefined>;
  hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean>;
  recalculateProductRating(productId: string): Promise<void>;
  
  getUserOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined>;
  getOrderWithItems(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByProviderPaymentId(providerPaymentId: string): Promise<Payment | undefined>;
  getPaymentsForOrder(orderId: string): Promise<Payment[]>;
  
  // Admin - Orders
  getAllOrdersWithUsers(): Promise<(Order & { user: User })[]>;
  getUserOrdersWithItems(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  
  getProductReviews(productId: string): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]>;
  getWishlistItemById(id: string): Promise<Wishlist | undefined>;
  addToWishlist(item: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(id: string): Promise<void>;
  
  createLoginEvent(event: InsertLoginEvent): Promise<LoginEvent>;
  getLoginEvents(userId?: string): Promise<LoginEvent[]>;
  getLoginAnalytics(days?: number): Promise<any>;
  getLoginEventsDetailed(): Promise<(LoginEvent & { user: User })[]>;
  
  getNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  addNewsletterSubscriber(email: string): Promise<NewsletterSubscriber>;
  removeNewsletterSubscriber(id: string): Promise<void>;
  
  // Admin - Users
  getAllUsers(): Promise<User[]>;
  
  getProductRequests(status?: string): Promise<ProductRequest[]>;
  createProductRequest(request: InsertProductRequest): Promise<ProductRequest>;
  updateProductRequestStatus(id: string, status: string): Promise<ProductRequest | undefined>;
  
  getTestimonials(visibleOnly?: boolean): Promise<Testimonial[]>;
  getTestimonial(id: string): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string): Promise<void>;
  
  getDeals(activeOnly?: boolean): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  getDealByCode(code: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<void>;
  
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;
  getProductsByCategorySlug(slug: string): Promise<Product[]>;
  
  getAnnouncements(activeOnly?: boolean): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<void>;
  
  getRecommendedProducts(userId?: string, productId?: string, limit?: number): Promise<Product[]>;
  getAllCartsWithTotals(): Promise<{
    user: User;
    items: (CartItem & { product: Product })[];
    totalValue: number;
  }[]>;
  
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const values = ensureId(insertUser);
    await db.insert(schema.users).values(values);
    const user = await selectById<User>(schema.users, values.id);
    if (!user) {
      throw new Error("Failed to create user");
    }
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const values = ensureId(userData);
    const { id, ...rest } = values;
    await db
      .insert(schema.users)
      .values({ id, ...rest })
      .onDuplicateKeyUpdate({
        set: {
          ...rest,
          updatedAt: new Date(),
        },
      });
    const user = await selectById<User>(schema.users, id);
    if (!user) {
      throw new Error("Failed to upsert user");
    }
    return user;
  }

  async getAllProducts(filters?: { category?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]> {
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(schema.products.category, filters.category));
    }
    
    if (filters?.minPrice !== undefined) {
      conditions.push(gte(schema.products.price, filters.minPrice.toString()));
    }
    
    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(schema.products.price, filters.maxPrice.toString()));
    }
    
    let query = db.select().from(schema.products);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const products = await query;
    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(schema.products)
      .where(eq(schema.products.isFeatured, true))
      .limit(8);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db.select().from(schema.products)
      .where(like(schema.products.title, `%${query}%`))
      .limit(20);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const values = ensureId(product);
    await db.insert(schema.products).values(values);
    const created = await selectById<Product>(schema.products, values.id);
    if (!created) {
      throw new Error("Failed to create product");
    }
    return created;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    await db.update(schema.products)
      .set(product)
      .where(eq(schema.products.id, id));
    return await this.getProduct(id);
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(schema.products).where(eq(schema.products.id, id));
  }

  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await db.select().from(schema.cartItems)
      .where(eq(schema.cartItems.userId, userId))
      .innerJoin(schema.products, eq(schema.cartItems.productId, schema.products.id));
    
    return items.map(item => ({
      ...item.cart_items,
      product: item.products
    }));
  }

  async getCartItemById(id: string): Promise<CartItem | undefined> {
    const [item] = await db.select().from(schema.cartItems).where(eq(schema.cartItems.id, id));
    return item;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const values = ensureId(item);
    await db.insert(schema.cartItems).values(values);
    const cartItem = await selectById<CartItem>(schema.cartItems, values.id);
    if (!cartItem) {
      throw new Error("Failed to create cart item");
    }
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    await db.update(schema.cartItems)
      .set({ quantity })
      .where(eq(schema.cartItems.id, id));
    return await this.getCartItemById(id);
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(schema.cartItems).where(eq(schema.cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));
  }

  async reduceStockForOrder(orderId: string): Promise<void> {
    const items = await db.select().from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, orderId));

    for (const item of items) {
      const [product] = await db.select({
        stockCount: schema.products.stockCount,
      }).from(schema.products)
        .where(eq(schema.products.id, item.productId));

      if (!product) {
        continue;
      }

      const currentStock = product.stockCount ?? 0;
      const nextStock = Math.max(0, currentStock - item.quantity);
      await db.update(schema.products)
        .set({
          stockCount: nextStock,
          downloads: sql`${schema.products.downloads} + ${item.quantity}`,
        })
        .where(eq(schema.products.id, item.productId));
    }
  }

  async getUserProductReview(userId: string, productId: string): Promise<Review | undefined> {
    const [review] = await db.select().from(schema.reviews)
      .where(and(
        eq(schema.reviews.userId, userId),
        eq(schema.reviews.productId, productId),
      ))
      .orderBy(desc(schema.reviews.createdAt))
      .limit(1);

    return review;
  }

  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const [row] = await db.select({
      orderId: schema.orders.id,
    })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(and(
        eq(schema.orders.userId, userId),
        eq(schema.orderItems.productId, productId),
        eq(schema.orders.status, "completed"),
      ))
      .limit(1);

    return !!row;
  }

  async recalculateProductRating(productId: string): Promise<void> {
    const [stats] = await db.select({
      average: sql<number>`COALESCE(AVG(${schema.reviews.rating}), 0)`,
      count: sql<number>`COUNT(${schema.reviews.id})`,
    })
      .from(schema.reviews)
      .where(eq(schema.reviews.productId, productId));

    const averageRating = Number(stats?.average ?? 0);
    const reviewCount = Number(stats?.count ?? 0);

    await db.update(schema.products)
      .set({
        rating: reviewCount > 0 ? averageRating.toFixed(2) : "0",
        reviewCount,
      })
      .where(eq(schema.products.id, productId));
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(schema.orders)
      .where(eq(schema.orders.userId, userId))
      .orderBy(desc(schema.orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    return order;
  }

  async getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(schema.orders)
      .where(eq(schema.orders.paymentIntentId, paymentIntentId));
    return order;
  }

  async getOrderWithItems(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    if (!order) return undefined;

    const items = await db.select().from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, id))
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id));

    return {
      ...order,
      items: items.map(item => ({
        ...item.order_items,
        product: item.products
      }))
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const values = ensureId(order);
    await db.insert(schema.orders).values(values);
    const newOrder = await selectById<Order>(schema.orders, values.id);
    if (!newOrder) {
      throw new Error("Failed to create order");
    }
    return newOrder;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const values = ensureId(item);
    await db.insert(schema.orderItems).values(values);
    const orderItem = await selectById<OrderItem>(schema.orderItems, values.id);
    if (!orderItem) {
      throw new Error("Failed to create order item");
    }
    return orderItem;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    await db.update(schema.orders)
      .set({ status })
      .where(eq(schema.orders.id, id));
    return await this.getOrder(id);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const values = ensureId(payment);
    await db.insert(schema.payments).values(values);
    const newPayment = await selectById<Payment>(schema.payments, values.id);
    if (!newPayment) {
      throw new Error("Failed to create payment");
    }
    return newPayment;
  }

  async getPaymentByProviderPaymentId(providerPaymentId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(schema.payments)
      .where(eq(schema.payments.providerPaymentId, providerPaymentId));
    return payment;
  }

  async getPaymentsForOrder(orderId: string): Promise<Payment[]> {
    return await db.select().from(schema.payments)
      .where(eq(schema.payments.orderId, orderId))
      .orderBy(desc(schema.payments.createdAt));
  }
  
  async getAllOrdersWithUsers(): Promise<(Order & { user: User })[]> {
    const rows = await db.select().from(schema.orders)
      .innerJoin(schema.users, eq(schema.orders.userId, schema.users.id))
      .orderBy(desc(schema.orders.createdAt));
    return rows.map(row => ({
      ...row.orders,
      user: row.users
    }));
  }
  
  async getUserOrdersWithItems(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const orders = await db.select().from(schema.orders)
      .where(eq(schema.orders.userId, userId))
      .orderBy(desc(schema.orders.createdAt));
    const results: (Order & { items: (OrderItem & { product: Product })[] })[] = [];
    for (const order of orders) {
      const items = await db.select().from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, order.id))
        .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id));
      results.push({
        ...order,
        items: items.map(item => ({
          ...item.order_items,
          product: item.products
        }))
      });
    }
    return results;
  }

  async getProductReviews(productId: string): Promise<(Review & { user: User })[]> {
    const reviews = await db.select().from(schema.reviews)
      .where(eq(schema.reviews.productId, productId))
      .innerJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
      .orderBy(desc(schema.reviews.createdAt));

    return reviews.map(review => ({
      ...review.reviews,
      user: review.users
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const values = ensureId(review);
    await db.insert(schema.reviews).values(values);
    await this.recalculateProductRating(review.productId);
    const newReview = await selectById<Review>(schema.reviews, values.id);
    if (!newReview) {
      throw new Error("Failed to create review");
    }
    return newReview;
  }

  async getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    const items = await db.select().from(schema.wishlist)
      .where(eq(schema.wishlist.userId, userId))
      .innerJoin(schema.products, eq(schema.wishlist.productId, schema.products.id));

    return items.map(item => ({
      ...item.wishlist,
      product: item.products
    }));
  }

  async getWishlistItemById(id: string): Promise<Wishlist | undefined> {
    const [item] = await db.select().from(schema.wishlist).where(eq(schema.wishlist.id, id));
    return item;
  }

  async addToWishlist(item: InsertWishlist): Promise<Wishlist> {
    const values = ensureId(item);
    await db.insert(schema.wishlist).values(values);
    const wishlistItem = await selectById<Wishlist>(schema.wishlist, values.id);
    if (!wishlistItem) {
      throw new Error("Failed to create wishlist item");
    }
    return wishlistItem;
  }

  async removeFromWishlist(id: string): Promise<void> {
    await db.delete(schema.wishlist).where(eq(schema.wishlist.id, id));
  }

  async createLoginEvent(event: InsertLoginEvent): Promise<LoginEvent> {
    const values = ensureId(event);
    await db.insert(schema.loginEvents).values(values);
    const loginEvent = await selectById<LoginEvent>(schema.loginEvents, values.id);
    if (!loginEvent) {
      throw new Error("Failed to create login event");
    }
    return loginEvent;
  }

  async getLoginEvents(userId?: string): Promise<LoginEvent[]> {
    if (userId) {
      return await db.select().from(schema.loginEvents)
        .where(eq(schema.loginEvents.userId, userId))
        .orderBy(desc(schema.loginEvents.createdAt));
    }
    return await db.select().from(schema.loginEvents)
      .orderBy(desc(schema.loginEvents.createdAt));
  }

  async getLoginAnalytics(days: number = 30): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const events = await db.select().from(schema.loginEvents)
      .where(sql`${schema.loginEvents.createdAt} >= ${since}`);
    
    return {
      totalLogins: events.length,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      byDate: events.reduce((acc, event) => {
        const date = event.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async getLoginEventsDetailed(): Promise<(LoginEvent & { user: User })[]> {
    const rows = await db.select().from(schema.loginEvents)
      .innerJoin(schema.users, eq(schema.loginEvents.userId, schema.users.id))
      .orderBy(desc(schema.loginEvents.createdAt));
    
    return rows.map(row => ({
      ...row.login_events,
      user: row.users
    }));
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return await db.select().from(schema.newsletterSubscribers)
      .where(eq(schema.newsletterSubscribers.isActive, true))
      .orderBy(desc(schema.newsletterSubscribers.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users)
      .orderBy(desc(schema.users.createdAt));
  }

  async addNewsletterSubscriber(email: string): Promise<NewsletterSubscriber> {
    const values = ensureId({ email });
    await db.insert(schema.newsletterSubscribers)
      .values(values)
      .onDuplicateKeyUpdate({
        set: { isActive: true },
      });
    const [subscriber] = await db.select().from(schema.newsletterSubscribers)
      .where(eq(schema.newsletterSubscribers.email, email));
    if (!subscriber) {
      throw new Error("Failed to upsert newsletter subscriber");
    }
    return subscriber;
  }

  async removeNewsletterSubscriber(id: string): Promise<void> {
    await db.update(schema.newsletterSubscribers)
      .set({ isActive: false })
      .where(eq(schema.newsletterSubscribers.id, id));
  }

  async getProductRequests(status?: string): Promise<ProductRequest[]> {
    if (status) {
      return await db.select().from(schema.productRequests)
        .where(eq(schema.productRequests.status, status))
        .orderBy(desc(schema.productRequests.createdAt));
    }
    return await db.select().from(schema.productRequests)
      .orderBy(desc(schema.productRequests.createdAt));
  }

  async createProductRequest(request: InsertProductRequest): Promise<ProductRequest> {
    const values = ensureId(request);
    await db.insert(schema.productRequests).values(values);
    const newRequest = await selectById<ProductRequest>(schema.productRequests, values.id);
    if (!newRequest) {
      throw new Error("Failed to create product request");
    }
    return newRequest;
  }

  async updateProductRequestStatus(id: string, status: string): Promise<ProductRequest | undefined> {
    await db.update(schema.productRequests)
      .set({ status })
      .where(eq(schema.productRequests.id, id));
    return await selectById<ProductRequest>(schema.productRequests, id);
  }

  async getTestimonials(visibleOnly: boolean = false): Promise<Testimonial[]> {
    if (visibleOnly) {
      return await db.select().from(schema.testimonials)
        .where(eq(schema.testimonials.isVisible, true))
        .orderBy(desc(schema.testimonials.createdAt));
    }
    return await db.select().from(schema.testimonials)
      .orderBy(desc(schema.testimonials.createdAt));
  }

  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(schema.testimonials)
      .where(eq(schema.testimonials.id, id));
    return testimonial;
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const values = ensureId(testimonial);
    await db.insert(schema.testimonials).values(values);
    const newTestimonial = await selectById<Testimonial>(schema.testimonials, values.id);
    if (!newTestimonial) {
      throw new Error("Failed to create testimonial");
    }
    return newTestimonial;
  }

  async updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    await db.update(schema.testimonials)
      .set(testimonial)
      .where(eq(schema.testimonials.id, id));
    return await selectById<Testimonial>(schema.testimonials, id);
  }

  async deleteTestimonial(id: string): Promise<void> {
    await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id));
  }

  async getDeals(activeOnly: boolean = false): Promise<Deal[]> {
    if (activeOnly) {
      const now = new Date();
      // Get all active deals first, then filter by date in application layer
      // This helps with timezone issues
      const allActiveDeals = await db.select().from(schema.deals)
        .where(eq(schema.deals.isActive, true))
        .orderBy(desc(schema.deals.createdAt));
      
      console.log(`Found ${allActiveDeals.length} active deals in database`);
      
      // Filter by date range in application layer to handle timezone correctly
      const filteredDeals = allActiveDeals.filter(deal => {
        try {
          // Handle both Date objects and string dates
          const startDate = deal.startDate instanceof Date 
            ? deal.startDate 
            : new Date(deal.startDate as any);
          const endDate = deal.endDate instanceof Date 
            ? deal.endDate 
            : new Date(deal.endDate as any);
          
          // Check if dates are valid
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn(`Invalid dates for deal ${deal.id}:`, { startDate: deal.startDate, endDate: deal.endDate });
            return false;
          }
          
          // Deal is valid if current time is between start and end date
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
    return await db.select().from(schema.deals)
      .orderBy(desc(schema.deals.createdAt));
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const [deal] = await db.select().from(schema.deals).where(eq(schema.deals.id, id));
    return deal;
  }

  async getDealByCode(code: string): Promise<Deal | undefined> {
    const now = new Date();
    const normalizedCode = code.toLowerCase();
    const [deal] = await db.select().from(schema.deals)
      .where(sql`LOWER(${schema.deals.code}) = ${normalizedCode}`);
    
    if (!deal) return undefined;
    
    // Check if deal is active and within date range
    if (!deal.isActive) return undefined;
    
    const startDate = deal.startDate instanceof Date 
      ? deal.startDate 
      : new Date(deal.startDate as any);
    const endDate = deal.endDate instanceof Date 
      ? deal.endDate 
      : new Date(deal.endDate as any);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return undefined;
    }
    
    if (startDate <= now && endDate >= now) {
      return deal;
    }
    
    return undefined;
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const values = ensureId(deal);
    await db.insert(schema.deals).values(values);
    const newDeal = await selectById<Deal>(schema.deals, values.id);
    if (!newDeal) {
      throw new Error("Failed to create deal");
    }
    return newDeal;
  }

  async updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined> {
    await db.update(schema.deals)
      .set(deal)
      .where(eq(schema.deals.id, id));
    return await selectById<Deal>(schema.deals, id);
  }

  async deleteDeal(id: string): Promise<void> {
    await db.delete(schema.deals).where(eq(schema.deals.id, id));
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(schema.categories)
      .orderBy(schema.categories.name);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(schema.categories)
      .where(eq(schema.categories.slug, slug));
    return category;
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(schema.categories)
      .where(eq(schema.categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const values = ensureId(category);
    await db.insert(schema.categories).values(values);
    const newCategory = await selectById<Category>(schema.categories, values.id);
    if (!newCategory) {
      throw new Error("Failed to create category");
    }
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    await db.update(schema.categories)
      .set(category)
      .where(eq(schema.categories.id, id));
    return await selectById<Category>(schema.categories, id);
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
  }

  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    const category = await this.getCategoryBySlug(slug);
    if (!category) return [];
    const normalizedName = category.name.toLowerCase();
    return await db.select().from(schema.products)
      .where(sql`LOWER(${schema.products.category}) = ${normalizedName}`);
  }

  async getAnnouncements(activeOnly: boolean = true): Promise<Announcement[]> {
    if (activeOnly) {
      return await db.select().from(schema.announcements)
        .where(eq(schema.announcements.isActive, true))
        .orderBy(desc(schema.announcements.priority), desc(schema.announcements.createdAt));
    }
    return await db.select().from(schema.announcements)
      .orderBy(desc(schema.announcements.priority), desc(schema.announcements.createdAt));
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(schema.announcements)
      .where(eq(schema.announcements.id, id));
    return announcement;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const values = ensureId(announcement);
    await db.insert(schema.announcements).values(values);
    const newAnnouncement = await selectById<Announcement>(schema.announcements, values.id);
    if (!newAnnouncement) {
      throw new Error("Failed to create announcement");
    }
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    await db.update(schema.announcements)
      .set({ ...announcement, updatedAt: new Date() })
      .where(eq(schema.announcements.id, id));
    return await selectById<Announcement>(schema.announcements, id);
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.delete(schema.announcements).where(eq(schema.announcements.id, id));
  }

  async getRecommendedProducts(userId?: string, productId?: string, limit: number = 8): Promise<Product[]> {
    // Simple recommendation: get products from same category or featured products
    if (productId) {
      const product = await this.getProduct(productId);
      if (product) {
        const similar = await db.select().from(schema.products)
          .where(and(
            eq(schema.products.category, product.category),
            sql`${schema.products.id} != ${productId}`
          ))
          .limit(limit);
        if (similar.length >= limit) return similar;
      }
    }
    
    // Fallback to featured products
    return await db.select().from(schema.products)
      .where(eq(schema.products.isFeatured, true))
      .limit(limit);
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    await db.update(schema.users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(schema.users.id, id));
    return await this.getUser(id);
  }

  async getAllCartsWithTotals(): Promise<{
    user: User;
    items: (CartItem & { product: Product })[];
    totalValue: number;
  }[]> {
    const rows = await db.select().from(schema.cartItems)
      .innerJoin(schema.users, eq(schema.cartItems.userId, schema.users.id))
      .innerJoin(schema.products, eq(schema.cartItems.productId, schema.products.id))
      .orderBy(desc(schema.cartItems.createdAt));

    const grouped = new Map<string, {
      user: User;
      items: (CartItem & { product: Product })[];
      totalValue: number;
    }>();

    for (const row of rows) {
      const user = row.users as User;
      const cartItem = row.cart_items as CartItem;
      const product = row.products as Product;
      const key = user.id;

      if (!grouped.has(key)) {
        grouped.set(key, { user, items: [], totalValue: 0 });
      }

      const summary = grouped.get(key)!;
      summary.items.push({
        ...cartItem,
        product,
      });

      const price = parseFloat((product.price as unknown as string) || "0");
      summary.totalValue += price * (cartItem.quantity ?? 0);
    }

    return Array.from(grouped.values()).map(summary => ({
      ...summary,
      totalValue: Number(summary.totalValue.toFixed(2)),
    }));
  }

  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const values = ensureId(token);
    await db.insert(schema.passwordResetTokens).values(values);
    const [resetToken] = await db.select().from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.token, values.token));
    if (!resetToken) {
      throw new Error("Failed to create password reset token");
    }
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.token, token));
    return resetToken;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await db.update(schema.passwordResetTokens)
      .set({ used: true })
      .where(eq(schema.passwordResetTokens.token, token));
  }
}

export const storage = new DbStorage();
