
// Static HTML Blog Generator
class BlogGenerator {
    constructor() {
        this.templateCache = {};
        this.init();
    }

    async init() {
        await this.loadTemplates();
        this.initFormHandlers();
    }

    async loadTemplates() {
        try {
            const response = await fetch('assets/templates/blog-template.html');
            this.templateCache.blog = await response.text();
        } catch (error) {
            console.error('Failed to load template:', error);
            this.templateCache.blog = this.getDefaultTemplate();
        }
    }

    getDefaultTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <meta name="description" content="{{description}}">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="../assets/css/style.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-white">
        <div class="container">
            <a class="navbar-brand" href="../index.html">AI Blogger</a>
        </div>
    </nav>
    
    <article class="container my-5">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <h1>{{title}}</h1>
                <div class="content">
                    {{{content}}}
                </div>
            </div>
        </div>
    </article>
    
    <script src="../assets/js/main.js"></script>
</body>
</html>`;
    }

    initFormHandlers() {
        const form = document.getElementById('blogForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateBlogPost();
            });
        }
    }

    generateBlogPost() {
        const title = document.getElementById('blogTitle').value;
        const content = document.getElementById('blogContent').value;
        const description = document.getElementById('blogDescription').value || 
                           content.substring(0, 160) + '...';
        const author = document.getElementById('blogAuthor').value || 'AI Blogger';
        const category = document.getElementById('blogCategory').value;
        const tags = document.getElementById('blogTags').value.split(',').map(tag => tag.trim());

        if (!title || !content) {
            this.showMessage('Please fill in title and content', 'error');
            return;
        }

        const blogData = {
            id: `blog-${Date.now()}`,
            title,
            content,
            description,
            author,
            date: new Date().toISOString().split('T')[0],
            category,
            tags,
            slug: this.generateSlug(title),
            readingTime: this.calculateReadingTime(content)
        };

        // Generate HTML
        const html = this.generateHTML(blogData);
        
        // Create downloadable file
        this.downloadFile(html, `${blogData.slug}.html`);
        
        // Save to localStorage
        this.saveBlogPost(blogData);
        
        this.showMessage('Blog post generated successfully!', 'success');
    }

    generateHTML(data) {
        let template = this.templateCache.blog || this.getDefaultTemplate();
        
        // Replace placeholders
        template = template
            .replace(/{{title}}/g, data.title)
            .replace(/{{description}}/g, data.description)
            .replace(/{{{content}}}/g, data.content)
            .replace(/{{author}}/g, data.author)
            .replace(/{{date}}/g, data.date)
            .replace(/{{readingTime}}/g, data.readingTime)
            .replace(/{{category}}/g, data.category)
            .replace(/{{tags}}/g, data.tags.join(', '));
        
        // Add SEO meta tags
        template = this.addSEOMetaTags(template, data);
        
        return template;
    }

    addSEOMetaTags(template, data) {
        const metaTags = `
    <meta name="description" content="${data.description}">
    <meta name="keywords" content="${data.tags.join(', ')}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${data.title}">
    <meta property="og:description" content="${data.description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://yourdomain.com/blog/${data.slug}.html">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${data.title}">
    <meta name="twitter:description" content="${data.description}">
    
    <!-- Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${data.title}",
        "description": "${data.description}",
        "author": {
            "@type": "Person",
            "name": "${data.author}"
        },
        "datePublished": "${data.date}",
        "dateModified": "${data.date}"
    }
    </script>`;
        
        // Insert meta tags after title
        return template.replace('</title>', `</title>${metaTags}`);
    }

    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    }

    calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
    }

    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    saveBlogPost(data) {
        let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        posts.unshift(data);
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // Update sitemap
        this.updateSitemap(posts);
        
        // Update recent posts display
        this.updateRecentPosts(posts);
    }

    updateSitemap(posts) {
        const sitemap = window.seoManager?.generateSitemap(posts);
        if (sitemap) {
            // Create downloadable sitemap
            const blob = new Blob([sitemap], { type: 'application/xml' });
            const sitemapUrl = URL.createObjectURL(blob);
            
            // Create download link
            const link = document.getElementById('sitemapLink');
            if (link) {
                link.href = sitemapUrl;
                link.download = 'sitemap.xml';
            }
        }
    }

    updateRecentPosts(posts) {
        const container = document.getElementById('recentPosts');
        if (!container) return;

        const recent = posts.slice(0, 5);
        container.innerHTML = recent.map(post => `
            <div class="list-group-item">
                <h6 class="mb-1">${post.title}</h6>
                <small class="text-muted">${post.date} • ${post.readingTime}</small>
                <a href="blog/${post.slug}.html" class="stretched-link"></a>
            </div>
        `).join('');
    }

    showMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        messageDiv.innerHTML = `
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        container.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Import from file
    importFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const posts = JSON.parse(e.target.result);
                if (Array.isArray(posts)) {
                    localStorage.setItem('blogPosts', JSON.stringify(posts));
                    this.showMessage('Blog posts imported successfully!', 'success');
                    window.location.reload();
                }
            } catch (error) {
                this.showMessage('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Export all posts
    exportAllPosts() {
        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const data = JSON.stringify(posts, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blog-posts-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize Blog Generator
document.addEventListener('DOMContentLoaded', () => {
    window.blogGenerator = new BlogGenerator();
});
