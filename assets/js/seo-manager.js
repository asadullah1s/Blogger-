
// SEO Management System
class SEOManager {
    constructor() {
        this.currentPage = window.location.pathname;
        this.init();
    }

    init() {
        this.updateMetaTags();
        this.initCanonicalURL();
        this.initSchemaMarkup();
        this.initLazyLoading();
        this.initSocialMeta();
    }

    updateMetaTags() {
        const page = this.getPageInfo();
        
        // Update title
        if (page.title) {
            document.title = page.title;
            this.updateMetaProperty('og:title', page.title);
            this.updateMetaProperty('twitter:title', page.title);
        }
        
        // Update description
        if (page.description) {
            this.updateMetaName('description', page.description);
            this.updateMetaProperty('og:description', page.description);
            this.updateMetaProperty('twitter:description', page.description);
        }
        
        // Update keywords
        if (page.keywords) {
            this.updateMetaName('keywords', page.keywords);
        }
    }

    getPageInfo() {
        const pages = {
            '/': {
                title: 'AI Blogger Pro | Create SEO-Optimized Blogs',
                description: 'Generate AI-powered, SEO-optimized blog posts instantly. No database needed.',
                keywords: 'AI blog, content generator, SEO, blogging platform'
            },
            '/ai-writer.html': {
                title: 'AI Content Generator | Create Blog Posts',
                description: 'Generate professional blog posts with AI assistance',
                keywords: 'AI writer, content creation, blog generator'
            },
            '/blog-listing.html': {
                title: 'Blog Articles | AI Blogger Pro',
                description: 'Browse all AI-generated blog posts and articles',
                keywords: 'blog articles, AI content, reading list'
            }
        };

        // Check for blog post pages
        if (this.currentPage.includes('/blog/')) {
            const slug = this.currentPage.split('/').pop().replace('.html', '');
            const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            const post = posts.find(p => p.slug === slug);
            
            if (post) {
                return {
                    title: post.meta?.title || post.title,
                    description: post.meta?.description || post.description,
                    keywords: post.meta?.keywords || post.tags?.join(', ')
                };
            }
        }

        return pages[this.currentPage] || pages['/'];
    }

    updateMetaName(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    updateMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    initCanonicalURL() {
        const canonicalUrl = `https://yourdomain.com${this.currentPage}`;
        let link = document.querySelector('link[rel="canonical"]');
        
        if (!link) {
            link = document.createElement('link');
            link.rel = 'canonical';
            document.head.appendChild(link);
        }
        
        link.href = canonicalUrl;
    }

    initSchemaMarkup() {
        const page = this.getPageInfo();
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: page.title,
            description: page.description,
            url: `https://yourdomain.com${this.currentPage}`,
            publisher: {
                '@type': 'Organization',
                name: 'AI Blogger Pro',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://yourdomain.com/assets/images/logo.png'
                }
            }
        };

        // For blog posts, add BlogPosting schema
        if (this.currentPage.includes('/blog/')) {
            schema['@type'] = 'BlogPosting';
            schema.datePublished = new Date().toISOString();
            schema.author = {
                '@type': 'Person',
                name: 'AI Blogger'
            };
        }

        this.addJsonLd(schema);
    }

    addJsonLd(data) {
        // Remove existing schema
        const existing = document.querySelector('script[type="application/ld+json"]');
        if (existing) existing.remove();

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    initSocialMeta() {
        // Set default social image if not specified
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
            const meta = document.createElement('meta');
            meta.setAttribute('property', 'og:image');
            meta.content = 'https://yourdomain.com/assets/images/og-default.png';
            document.head.appendChild(meta);
        }

        // Set Twitter card
        const twitterCard = document.querySelector('meta[name="twitter:card"]');
        if (!twitterCard) {
            const meta = document.createElement('meta');
            meta.name = 'twitter:card';
            meta.content = 'summary_large_image';
            document.head.appendChild(meta);
        }
    }

    // Generate robots.txt content
    generateRobotsTxt() {
        return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://yourdomain.com/sitemap.xml`;
    }

    // Generate sitemap.xml
    generateSitemap(posts = []) {
        const baseUrl = 'https://yourdomain.com';
        const pages = [
            { url: '/', priority: 1.0, changefreq: 'daily' },
            { url: '/blog-listing.html', priority: 0.9, changefreq: 'weekly' },
            { url: '/ai-writer.html', priority: 0.8, changefreq: 'monthly' },
            { url: '/about.html', priority: 0.7, changefreq: 'monthly' },
            { url: '/contact.html', priority: 0.7, changefreq: 'monthly' }
        ];

        // Add blog posts
        posts.forEach(post => {
            pages.push({
                url: `/blog/${post.slug}.html`,
                priority: 0.8,
                changefreq: 'monthly',
                lastmod: post.date
            });
        });

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `
    <url>
        <loc>${baseUrl}${page.url}</loc>
        ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`).join('')}
</urlset>`;
    }
}

// Initialize SEO Manager
document.addEventListener('DOMContentLoaded', () => {
    window.seoManager = new SEOManager();
});
