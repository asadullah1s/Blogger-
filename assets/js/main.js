
// Main Application Controller
class BloggerApp {
    constructor() {
        this.blogPosts = [];
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.loadBlogPosts();
        this.initTheme();
        this.initSearch();
        this.initScrollAnimations();
        this.initServiceWorker();
        this.updateReadingProgress();
    }

    // Load blog posts from localStorage or default
    loadBlogPosts() {
        const storedPosts = localStorage.getItem('blogPosts');
        
        if (storedPosts) {
            this.blogPosts = JSON.parse(storedPosts);
        } else {
            // Default sample posts
            this.blogPosts = [
                {
                    id: 'post-1',
                    title: 'Getting Started with AI Blogging',
                    description: 'Learn how to create SEO-optimized content using AI',
                    content: 'Full content here...',
                    author: 'AI Blogger',
                    date: '2024-01-15',
                    readTime: '5 min',
                    category: 'Tutorial',
                    tags: ['AI', 'Blogging', 'SEO'],
                    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h-250&fit=crop',
                    slug: 'getting-started-ai-blogging',
                    meta: {
                        title: 'AI Blogging Guide | Complete Tutorial',
                        description: 'Learn how to create SEO-optimized blogs using artificial intelligence',
                        keywords: 'AI blogging, content creation, SEO optimization'
                    }
                },
                {
                    id: 'post-2',
                    title: 'SEO Strategies for 2024',
                    description: 'Top SEO techniques to rank higher in search engines',
                    content: 'Full content here...',
                    author: 'SEO Expert',
                    date: '2024-01-10',
                    readTime: '8 min',
                    category: 'SEO',
                    tags: ['SEO', 'Marketing', 'Google'],
                    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h-250&fit=crop',
                    slug: 'seo-strategies-2024',
                    meta: {
                        title: 'SEO Strategies 2024 | Complete Guide',
                        description: 'Master the latest SEO techniques for better rankings',
                        keywords: 'SEO 2024, search engine optimization, ranking factors'
                    }
                }
            ];
            this.savePosts();
        }
        
        this.renderBlogPosts();
    }

    savePosts() {
        localStorage.setItem('blogPosts', JSON.stringify(this.blogPosts));
    }

    // Render blog posts to the page
    renderBlogPosts() {
        const container = document.getElementById('blogPostsContainer');
        if (!container) return;

        container.innerHTML = this.blogPosts.map(post => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="blog-card animate-on-scroll">
                    <img src="${post.image}" alt="${post.title}" class="card-img-top" loading="lazy">
                    <div class="blog-card-body">
                        <span class="badge bg-primary mb-2">${post.category}</span>
                        <h5 class="blog-card-title">${post.title}</h5>
                        <p class="blog-card-text">${post.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="far fa-calendar me-1"></i>${post.date}
                            </small>
                            <span class="read-time">
                                <i class="far fa-clock me-1"></i>${post.readTime} read
                            </span>
                        </div>
                    </div>
                    <div class="blog-card-footer">
                        <a href="blog/${post.slug}.html" class="btn btn-outline-primary btn-sm">
                            Read More <i class="fas fa-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        this.triggerScrollAnimations();
    }

    // Initialize dark/light theme
    initTheme() {
        const toggle = document.getElementById('darkModeToggle');
        if (!toggle) return;

        this.applyTheme(this.currentTheme);
        
        toggle.addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(this.currentTheme);
            localStorage.setItem('theme', this.currentTheme);
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.innerHTML = theme === 'dark' 
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
        }
    }

    // Initialize search functionality
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch(searchInput.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch(searchInput.value);
            });
        }
    }

    performSearch(query) {
        if (!query.trim()) return;

        const results = this.blogPosts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.description.toLowerCase().includes(query.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        if (results.length > 0) {
            // Navigate to search results page or show modal
            this.showSearchResults(results, query);
        } else {
            this.showNoResults(query);
        }
    }

    showSearchResults(results, query) {
        // Create modal or redirect to search results page
        alert(`Found ${results.length} results for "${query}"`);
    }

    // Scroll animations
    initScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    }

    triggerScrollAnimations() {
        // Re-trigger animation observer after new content loads
        setTimeout(() => this.initScrollAnimations(), 100);
    }

    // Reading progress bar
    updateReadingProgress() {
        const article = document.querySelector('article');
        if (!article) return;

        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.scrollY;
            const articleTop = article.offsetTop;
            
            if (scrollTop >= articleTop) {
                const progress = ((scrollTop - articleTop) / (articleHeight - windowHeight)) * 100;
                progressBar.style.transform = `scaleX(${Math.min(progress, 100) / 100})`;
            } else {
                progressBar.style.transform = 'scaleX(0)';
            }
        });
    }

    // Service Worker for offline support
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('assets/js/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registered:', registration);
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed:', error);
                    });
            });
        }
    }

    // Calculate reading time
    calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
    }

    // Generate table of contents for a blog post
    generateTableOfContents(articleId) {
        const article = document.getElementById(articleId);
        if (!article) return null;

        const headings = article.querySelectorAll('h2, h3');
        const toc = [];
        
        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
            
            toc.push({
                id: heading.id,
                text: heading.textContent,
                level: heading.tagName.toLowerCase()
            });
        });

        return toc;
    }

    // Render table of contents
    renderTableOfContents(toc, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !toc.length) return;

        const html = `
            <div class="toc-title">Table of Contents</div>
            <ul class="toc-list">
                ${toc.map(item => `
                    <li class="toc-${item.level}">
                        <a href="#${item.id}">${item.text}</a>
                    </li>
                `).join('')}
            </ul>
        `;
        
        container.innerHTML = html;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bloggerApp = new BloggerApp();
});
