import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { requireAuth, requireAdmin } from "./authUtils";
import { insertProductSchema, insertDealSchema, insertTestimonialSchema, insertCategorySchema, insertAnnouncementSchema } from "@shared/schema";
import { uploadProductImage, getImageUrl } from "./upload";

export function registerAdminRoutes(app: Express) {
  // Image upload endpoint
  app.post("/api/admin/upload", requireAuth, requireAdmin, uploadProductImage.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const imageUrl = getImageUrl(req.file.filename, 'product');
      res.json({ url: imageUrl, filename: req.file.filename });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Orders - admin visibility
  app.get("/api/admin/orders", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const orders = await storage.getAllOrdersWithUsers();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/carts", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const carts = await storage.getAllCartsWithTotals();
      res.json(carts);
    } catch (error) {
      console.error("Error fetching admin carts:", error);
      res.status(500).json({ message: "Failed to fetch carts" });
    }
  });

  app.get("/api/admin/users/:id/orders", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const orders = await storage.getUserOrdersWithItems(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders for admin:", error);
      res.status(500).json({ message: "Failed to fetch user orders" });
    }
  });

  // Login Events - detailed list for admin
  app.get("/api/admin/logins", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const events = await storage.getLoginEventsDetailed();
      res.json(events);
    } catch (error) {
      console.error("Error fetching login events:", error);
      res.status(500).json({ message: "Failed to fetch login events" });
    }
  });

  // Users - list all users for admin
  app.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/products", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log(`[PRODUCT UPDATE] Updating product ${req.params.id}`);
      console.log(`[PRODUCT UPDATE] Request body:`, JSON.stringify(req.body, null, 2));
      
      // Check if product exists first
      const existingProduct = await storage.getProduct(req.params.id);
      if (!existingProduct) {
        console.log(`[PRODUCT UPDATE] Product not found: ${req.params.id}`);
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Clean up the body - remove undefined, null, and empty string values for optional fields
      const body: any = { ...req.body };
      Object.keys(body).forEach(key => {
        if (body[key] === undefined || body[key] === null || body[key] === '') {
          // Keep required fields, remove optional ones
          const requiredFields = ['title', 'description', 'category', 'price', 'image', 'author', 'licenseType'];
          if (!requiredFields.includes(key)) {
            delete body[key];
          }
        }
      });
      
      // Ensure numeric fields are properly formatted
      if (body.price !== undefined) {
        body.price = String(body.price);
      }
      if (body.rating !== undefined) {
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
      if (error instanceof z.ZodError) {
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
        ...(error instanceof Error && error.stack && { stack: error.stack })
      } : undefined;
      
      res.status(500).json({ 
        message: "Failed to update product",
        ...(errorDetails && { error: errorDetails })
      });
    }
  });

  app.delete("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorDetails = process.env.NODE_ENV === "development" ? errorMessage : undefined;
      res.status(500).json({ 
        message: "Failed to delete product",
        ...(errorDetails && { error: errorDetails })
      });
    }
  });

  app.get("/api/admin/deals", requireAuth, requireAdmin, async (req, res) => {
    try {
      const deals = await storage.getDeals();
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.post("/api/admin/deals", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Transform date strings to Date objects for validation
      const body: any = { ...req.body };
      if (body.startDate) {
        if (typeof body.startDate === 'string') {
          const date = new Date(body.startDate);
          if (isNaN(date.getTime())) {
            return res.status(400).json({ message: "Invalid startDate format" });
          }
          body.startDate = date;
        }
      }
      if (body.endDate) {
        if (typeof body.endDate === 'string') {
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
      if (error instanceof z.ZodError) {
        console.error("Validation error details:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating deal:", error);
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.patch("/api/admin/deals/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log(`[DEAL UPDATE] Updating deal ${req.params.id}`);
      console.log(`[DEAL UPDATE] Request body:`, JSON.stringify(req.body, null, 2));
      
      // Check if deal exists first
      const existingDeal = await storage.getDeal(req.params.id);
      if (!existingDeal) {
        console.log(`[DEAL UPDATE] Deal not found: ${req.params.id}`);
        return res.status(404).json({ message: "Deal not found" });
      }
      console.log(`[DEAL UPDATE] Existing deal:`, JSON.stringify(existingDeal, null, 2));

      // Transform date strings to Date objects for validation
      const body: any = { ...req.body };
      
      // Remove fields that shouldn't be updated
      delete body.id;
      delete body.createdAt;
      
      // Check if code is being changed and if it conflicts with another deal
      if (body.code && body.code !== existingDeal.code) {
        console.log(`[DEAL UPDATE] Checking code conflict: ${body.code}`);
        const dealWithCode = await storage.getDealByCode(body.code);
        if (dealWithCode && dealWithCode.id !== req.params.id) {
          console.log(`[DEAL UPDATE] Code conflict found with deal: ${dealWithCode.id}`);
          return res.status(400).json({ message: "A deal with this code already exists" });
        }
      }
      
      if (body.startDate) {
        if (typeof body.startDate === 'string') {
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
        if (typeof body.endDate === 'string') {
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
      if (error instanceof z.ZodError) {
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
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Check for database constraint violations
      if (errorMessage.includes('unique') || errorMessage.includes('duplicate') || errorMessage.includes('violates unique constraint')) {
        return res.status(400).json({ 
          message: "A deal with this code already exists",
          error: process.env.NODE_ENV === "development" ? errorMessage : undefined
        });
      }
      
      const errorDetails = process.env.NODE_ENV === "development" ? {
        message: errorMessage,
        ...(errorStack && { stack: errorStack })
      } : undefined;
      
      res.status(500).json({ 
        message: "Failed to update deal",
        ...(errorDetails && { error: errorDetails })
      });
    }
  });

  app.delete("/api/admin/deals/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteDeal(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting deal:", error);
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  app.get("/api/admin/testimonials", requireAuth, requireAdmin, async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/admin/testimonials", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validated);
      res.json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating testimonial:", error);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  app.patch("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertTestimonialSchema.partial().parse(req.body);
      const testimonial = await storage.updateTestimonial(req.params.id, validated);
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating testimonial:", error);
      res.status(500).json({ message: "Failed to update testimonial" });
    }
  });

  app.delete("/api/admin/testimonials/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteTestimonial(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });

  app.get("/api/admin/analytics/logins", requireAuth, requireAdmin, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const analytics = await storage.getLoginAnalytics(days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching login analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/newsletter-subscribers", requireAuth, requireAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  app.get("/api/admin/product-requests", requireAuth, requireAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const requests = await storage.getProductRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching product requests:", error);
      res.status(500).json({ message: "Failed to fetch product requests" });
    }
  });

  app.patch("/api/admin/product-requests/:id", requireAuth, requireAdmin, async (req, res) => {
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

  // Categories Admin Routes
  app.get("/api/admin/categories", requireAuth, requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/categories", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validated);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, validated);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Announcements Admin Routes
  app.get("/api/admin/announcements", requireAuth, requireAdmin, async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements(false);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validated);
      res.json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.patch("/api/admin/announcements/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validated = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(req.params.id, validated);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      await storage.deleteAnnouncement(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });
}
