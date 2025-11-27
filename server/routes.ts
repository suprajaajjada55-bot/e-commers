import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { requireAuth } from "./authUtils";
import { z } from "zod";
import { insertCartItemSchema, insertReviewSchema, insertWishlistSchema } from "@shared/schema";
import { apiRateLimiter, searchRateLimiter } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - Replit Auth integration
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
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

  app.post("/api/testimonials/feedback", apiRateLimiter, async (req, res) => {
    try {
      const bodySchema = z.object({
        rating: z.number().int().min(1).max(5),
        content: z.string().min(10).max(600),
        name: z.string().trim().min(1).max(80).optional(),
        role: z.string().trim().max(80).optional(),
      });

      const { rating, content, name, role } = bodySchema.parse(req.body);
      const user = (req as any).user;

      const testimonial = await storage.createTestimonial({
        name: name ?? user?.name ?? "Anonymous Customer",
        role: role ?? (user?.role === "admin" ? "Administrator" : "Customer"),
        avatar: user?.avatar ?? null,
        rating,
        content,
        isVerified: false,
        isVisible: true,
      });

      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid feedback data", errors: error.errors });
      }
      console.error("Error creating testimonial feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      const products = await storage.getAllProducts(
        category ? { category: category as string } : undefined
      );
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorDetails = process.env.NODE_ENV === "development" ? errorMessage : undefined;
      res.status(500).json({ 
        message: "Failed to fetch products",
        ...(errorDetails && { error: errorDetails })
      });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
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

  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const products = await storage.searchProducts(req.params.query);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Cart routes (protected)
  app.get("/api/cart", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      
      // Validate request body
      const bodySchema = z.object({
        productId: z.string(),
        quantity: z.number().int().positive().optional(),
      });
      const validated = bodySchema.parse(req.body);

      const product = await storage.getProduct(validated.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if ((product.stockCount ?? 0) <= 0) {
        return res.status(400).json({ message: "Product is currently out of stock" });
      }
      
      // Check if item already exists in cart
      const existingItems = await storage.getCartItems(userId);
      const existingItem = existingItems.find(item => item.productId === validated.productId);
      
      if (existingItem) {
        // Update quantity if item already exists
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
        // Add new item if it doesn't exist
        const cartItem = await storage.addToCart({
          userId,
          productId: validated.productId,
          quantity: desiredQuantity,
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

  app.patch("/api/cart/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      
      // Validate request body
      const bodySchema = z.object({
        quantity: z.number().int().positive(),
      });
      const validated = bodySchema.parse(req.body);
      
      // Verify ownership
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

  app.delete("/api/cart/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      
      // Verify ownership
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

  app.post("/api/cart/merge", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      
      const bodySchema = z.object({
        items: z.array(z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
        })),
      });
      const validated = bodySchema.parse(req.body);
      
      const existingCartItems = await storage.getCartItems(userId);
      
      for (const item of validated.items) {
        const product = await storage.getProduct(item.productId);
        if (!product || (product.stockCount ?? 0) <= 0) {
          continue;
        }
        const existingItem = existingCartItems.find(ci => ci.productId === item.productId);
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
            quantity: quantityToAdd,
          });
          existingCartItems.push({
            ...created,
            product,
          } as any);
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

  // Guest cart endpoint (for localStorage persistence)
  app.post("/api/cart/guest", async (req, res) => {
    try {
      // This endpoint accepts guest cart data and returns it
      // Frontend can store in localStorage and merge on login
      const bodySchema = z.object({
        items: z.array(z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
        })),
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

  // Wishlist routes (protected)
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlist = await storage.getWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const bodySchema = z.object({
        productId: z.string(),
      });
      const validated = bodySchema.parse(req.body);
      
      const wishlistItem = await storage.addToWishlist({
        userId,
        productId: validated.productId,
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

  app.delete("/api/wishlist/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify ownership
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

  // Review routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const bodySchema = z.object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
      });
      const validated = bodySchema.parse(req.body);

      const productId = req.params.id;
      const hasPurchased = await storage.hasUserPurchasedProduct(userId, productId);

      const review = await storage.createReview({
        productId,
        userId,
        rating: validated.rating,
        comment: validated.comment,
        isVerifiedPurchase: hasPurchased,
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

  // Order routes (protected)
  app.get("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req: any, res) => {
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
            userReview: review ?? null,
          };
        })
      );

      res.json({
        ...order,
        items: itemsWithReviews,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Announcements API
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements(true);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Enhanced search API with AI support
  app.get("/api/search", searchRateLimiter, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({ results: [] });
      }
      
      // AI-powered natural language search
      // Extract price range, category hints, etc.
      const priceMatch = query.match(/(?:under|below|less than|max|upto|up to)\s*[₹$]?(\d+)/i);
      const categoryHints = ['ui kit', 'template', 'plugin', 'ai tool', 'code script', 'mobile app'];
      const detectedCategory = categoryHints.find(cat => query.toLowerCase().includes(cat));
      
      let products = await storage.searchProducts(query);
      
      // Filter by price if detected
      if (priceMatch) {
        const maxPrice = parseFloat(priceMatch[1]);
        products = products.filter(p => parseFloat(p.price) <= maxPrice);
      }
      
      // Filter by category if detected
      if (detectedCategory) {
        products = products.filter(p => 
          p.category.toLowerCase().includes(detectedCategory) ||
          p.title.toLowerCase().includes(detectedCategory)
        );
      }
      
      const results = products.slice(0, 10).map(p => ({
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

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      const allProducts = await storage.getAllProducts();
      
      // Get product counts for each category using case-insensitive matching
      const categoriesWithCounts = await Promise.all(
        categories.map(async (cat) => {
          // Count products where category matches (case-insensitive)
          const products = allProducts.filter(p => 
            p.category && p.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
          );
          return { ...cat, productCount: products.length };
        })
      );
      
      res.json(categoriesWithCounts);
    } catch (error) {
      console.error("Error fetching categories:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorDetails = process.env.NODE_ENV === "development" ? errorMessage : undefined;
      res.status(500).json({ 
        message: "Failed to fetch categories",
        ...(errorDetails && { error: errorDetails })
      });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const products = await storage.getProductsByCategorySlug(req.params.slug);
      res.json({ category, products });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // AI Recommendations API
  app.get("/api/recommendations", async (req, res) => {
    try {
      const userId = (req as any).user?.userId;
      const productId = req.query.productId as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      
      const recommendations = await storage.getRecommendedProducts(userId, productId, limit);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Chatbot API
  app.post("/api/chat", apiRateLimiter, async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Simple AI response logic - can be enhanced with OpenAI/Claude API
      const lowerMessage = message.toLowerCase();
      let response = 'I can help you with:\n- Finding products\n- Order tracking\n- Product information\n- General questions';
      
      if (lowerMessage.includes('order') || lowerMessage.includes('purchase') || lowerMessage.includes('track')) {
        response = 'To track your order, please log in and visit the Orders section. If you need help with a specific order, please contact our support team.';
      } else if (lowerMessage.includes('product') || lowerMessage.includes('item') || lowerMessage.includes('find')) {
        response = 'You can browse our products by category or use the search bar. What type of product are you looking for?';
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('discount')) {
        response = 'Product prices are displayed on each product page. We also have special deals and discounts - check out the Deals page!';
      } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('razorpay')) {
        response = 'We accept payments through Razorpay. All transactions are secure and encrypted.';
      } else if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
        response = 'We have several categories: UI Kits, Templates, Plugins, AI Tools, Code Scripts, and Mobile Apps. Browse by category to find what you need!';
      } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        response = 'I can help you with product searches, order information, and general questions. You can also contact our support team through the Contact page.';
      }

      res.json({ response });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });





  

  // Testimonials API
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials(true);
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Deals API
  app.get("/api/deals", async (req, res) => {
    try {
      // Get all deals first for debugging
      const allDeals = await storage.getDeals(false);
      console.log(`Total deals in database: ${allDeals.length}`);
      
      // Get only active deals within date range
      const activeDeals = await storage.getDeals(true);
      console.log(`Active deals within date range: ${activeDeals.length}`);
      
      // Log details of all deals for debugging
      if (allDeals.length > 0) {
        console.log('All deals:', allDeals.map(d => ({
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

  // Coupon validation API
  app.post("/api/coupon/validate", async (req, res) => {
    try {
      // Ensure we always return JSON
      res.setHeader('Content-Type', 'application/json');
      
      const { code } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Coupon code is required" });
      }

      const normalizedCode = code.trim().toUpperCase();
      console.log('Validating coupon code:', normalizedCode);
      
      const deal = await storage.getDealByCode(normalizedCode);
      
      if (!deal) {
        console.log('Coupon not found or invalid:', normalizedCode);
        return res.status(404).json({ 
          message: "Invalid or expired coupon code",
          valid: false 
        });
      }

      console.log('Coupon validated successfully:', deal.code, deal.title);
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
    } catch (error: any) {
      console.error("Error validating coupon:", error);
      return res.status(500).json({ message: "Failed to validate coupon", error: error.message });
    }
  });













  // Newsletter subscription API
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const bodySchema = z.object({
        email: z.string().email(),
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

  // Product request API
  app.post("/api/product-requests", async (req, res) => {
    try {
      const bodySchema = z.object({
        productName: z.string().min(1),
        email: z.string().email(),
        message: z.string().optional(),
      });
      const validated = bodySchema.parse(req.body);
      
      await storage.createProductRequest({
        productName: validated.productName,
        email: validated.email,
        message: validated.message,
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


  
  // Home slides API
// Home slides API











// ✅ API Endpoint for Hero Slides
app.get("/api/home-slides", async (req, res) => {
  try {
    const slides = [
      {
        id: 1,
        title: "Premium Digital Products",
        subtitle: "2026 Collection",
        description:
          "Discover cutting-edge digital solutions for your business",
        ctaText: "Explore Now",
        ctaLink: "/products",
        imageUrl: "/attached_assets/stock_images/modern_digital_marke_8c277cbd.jpg",
        backgroundColor: "#f97316",
        highlights: [
          "Exclusive access to premium digital templates and tools",
          "Handpicked resources for professionals and creators",
          "Seamless downloads with secure payment options",
        ],
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
          "Unlock 50% discounts before the sale ends!",
        ],
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
          "Revolutionize your business with intelligent software",
        ],
      },
    ];

    res.json(slides);
  } catch (error) {
    console.error("Error fetching home slides:", error);
    res.status(500).json({ message: "Failed to fetch home slides" });
  }
});













  const httpServer = createServer(app);

  return httpServer;
}
