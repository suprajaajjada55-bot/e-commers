import type { Express } from "express";
import { storage } from "./storage";

export function registerSitemapRoutes(app: Express) {
  // Generate sitemap.xml
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
      
      const products = await storage.getAllProducts();
      const categories = await storage.getCategories();
      
      const urls = [
        { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
        { loc: `${baseUrl}/products`, changefreq: 'daily', priority: '0.9' },
        { loc: `${baseUrl}/deals`, changefreq: 'daily', priority: '0.8' },
        { loc: `${baseUrl}/categories`, changefreq: 'weekly', priority: '0.8' },
        { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.7' },
        { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: '0.6' },
        ...categories.map(cat => ({
          loc: `${baseUrl}/categories/${cat.slug}`,
          changefreq: 'weekly',
          priority: '0.7'
        })),
        ...products.map(product => ({
          loc: `${baseUrl}/products/${product.id}`,
          changefreq: 'weekly',
          priority: '0.6'
        }))
      ];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      res.setHeader('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = process.env.BASE_URL || `http://${req.get('host')}`;
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(robots);
  });
}

