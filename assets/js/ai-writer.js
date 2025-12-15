
// AI Content Generator with DeepSeek Integration
class AIWriter {
    constructor() {
        this.apiKey = localStorage.getItem('deepseek_api_key') || '';
        this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
        this.isGenerating = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAPIKey();
        this.initTextEditor();
    }

    bindEvents() {
        // Generate button
        document.getElementById('generateBtn')?.addEventListener('click', () => this.generateContent());
        
        // Save as HTML button
        document.getElementById('saveHtmlBtn')?.addEventListener('click', () => this.saveAsHTML());
        
        // API key management
        document.getElementById('saveApiKeyBtn')?.addEventListener('click', () => this.saveAPIKey());
        document.getElementById('showApiKeyBtn')?.addEventListener('click', () => this.toggleAPIKeyVisibility());
    }

    loadAPIKey() {
        const storedKey = localStorage.getItem('deepseek_api_key');
        if (storedKey) {
            this.apiKey = storedKey;
            // Mask the key in UI
            document.getElementById('apiKeyInput').value = '••••••••' + storedKey.slice(-4);
        }
    }

    saveAPIKey() {
        const input = document.getElementById('apiKeyInput');
        const key = input.value;
        
        if (key && key.length > 20) {
            this.apiKey = key;
            localStorage.setItem('deepseek_api_key', key);
            this.showAlert('API key saved successfully!', 'success');
            
            // Mask the key
            input.value = '••••••••' + key.slice(-4);
        } else {
            this.showAlert('Please enter a valid API key', 'danger');
        }
    }

    toggleAPIKeyVisibility() {
        const input = document.getElementById('apiKeyInput');
        const btn = document.getElementById('showApiKeyBtn');
        
        if (input.type === 'password') {
            input.type = 'text';
            btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            btn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    async generateContent() {
        if (this.isGenerating) return;
        
        const prompt = document.getElementById('aiPrompt').value;
        const tone = document.getElementById('toneSelect').value;
        const length = document.getElementById('lengthSelect').value;
        const keywords = document.getElementById('keywordsInput').value;
        
        if (!prompt.trim()) {
            this.showAlert('Please enter a prompt', 'warning');
            return;
        }

        if (!this.apiKey) {
            this.showAlert('Please set your API key first', 'danger');
            return;
        }

        this.isGenerating = true;
        this.showLoading(true);

        try {
            const fullPrompt = this.buildPrompt(prompt, tone, length, keywords);
            const content = await this.callDeepSeekAPI(fullPrompt);
            
            this.insertGeneratedContent(content);
            this.generateSEOMetadata(content);
            
        } catch (error) {
            console.error('AI Generation Error:', error);
            this.showAlert('Failed to generate content. Please try again.', 'danger');
        } finally {
            this.isGenerating = false;
            this.showLoading(false);
        }
    }

    buildPrompt(prompt, tone, length, keywords) {
        return `Write a professional blog post about: "${prompt}"
        
        Tone: ${tone}
        Length: ${length}
        Keywords to include: ${keywords}
        
        Requirements:
        1. Start with an engaging H1 title
        2. Write a compelling meta description
        3. Include H2 and H3 subheadings
        4. Add bullet points where appropriate
        5. Include a FAQ section with 3-5 questions
        6. End with a conclusion
        7. Add relevant schema.org markup suggestions
        8. Suggest 3-5 tags
        
        Format the response in HTML with proper semantic tags.
        Do not include markdown, only HTML.`;
    }

    async callDeepSeekAPI(prompt) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional SEO content writer and HTML expert.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }

    insertGeneratedContent(content) {
        const editor = document.getElementById('contentEditor');
        if (editor) {
            editor.innerHTML = content;
            this.initTextEditor(); // Reinitialize editor tools
        }
    }

    initTextEditor() {
        // Initialize toolbar functionality
        const toolbarActions = {
            'formatH1': () => this.formatText('h1'),
            'formatH2': () => this.formatText('h2'),
            'formatH3': () => this.formatText('h3'),
            'bold': () => document.execCommand('bold'),
            'italic': () => document.execCommand('italic'),
            'unorderedList': () => document.execCommand('insertUnorderedList'),
            'orderedList': () => document.execCommand('insertOrderedList'),
            'insertImage': () => this.insertImage(),
            'insertCode': () => this.insertCodeBlock()
        };

        Object.keys(toolbarActions).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', toolbarActions[id]);
            }
        });
    }

    formatText(tag) {
        document.execCommand('formatBlock', false, tag);
    }

    insertImage() {
        const url = prompt('Enter image URL:');
        if (url) {
            const html = `<img src="${url}" alt="" class="img-fluid" loading="lazy">`;
            document.execCommand('insertHTML', false, html);
        }
    }

    insertCodeBlock() {
        const html = `<pre><code class="language-javascript">// Your code here</code></pre>`;
        document.execCommand('insertHTML', false, html);
    }

    generateSEOMetadata(content) {
        // Extract title from content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const title = tempDiv.querySelector('h1')?.textContent || 'Generated Blog Post';
        
        // Extract description (first paragraph)
        const firstPara = tempDiv.querySelector('p')?.textContent || '';
        const description = firstPara.substring(0, 160) + '...';
        
        // Extract keywords from content
        const words = content.toLowerCase().split(/\W+/);
        const wordCount = {};
        words.forEach(word => {
            if (word.length > 4) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });
        
        const keywords = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word)
            .join(', ');

        // Update form fields
        document.getElementById('postTitle').value = title;
        document.getElementById('metaDescription').value = description;
        document.getElementById('metaKeywords').value = keywords;
        
        // Generate slug
        const slug = title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');
        document.getElementById('postSlug').value = slug;
    }

    async saveAsHTML() {
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('contentEditor').innerHTML;
        const metaDescription = document.getElementById('metaDescription').value;
        const metaKeywords = document.getElementById('metaKeywords').value;
        const slug = document.getElementById('postSlug').value;
        const author = document.getElementById('postAuthor').value || 'AI Blogger';
        
        if (!title || !content) {
            this.showAlert('Please add title and content', 'warning');
            return;
        }

        // Create blog post object
        const blogPost = {
            id: `post-${Date.now()}`,
            title,
            description: metaDescription,
            content,
            author,
            date: new Date().toISOString().split('T')[0],
            readTime: window.bloggerApp?.calculateReadingTime(content) || '5 min',
            category: document.getElementById('postCategory').value,
            tags: metaKeywords.split(',').map(tag => tag.trim()),
            slug,
            meta: {
                title: `${title} | AI Blogger`,
                description: metaDescription,
                keywords: metaKeywords
            }
        };

        // Generate HTML file
        const htmlTemplate = this.generateHTMLTemplate(blogPost);
        this.downloadHTMLFile(htmlTemplate, `${slug}.html`);
        
        // Save to localStorage
        this.saveToLocalStorage(blogPost);
        
        this.showAlert('Blog post saved successfully!', 'success');
    }

    generateHTMLTemplate(post) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.meta.title}</title>
    <meta name="description" content="${post.meta.description}">
    <meta name="keywords" content="${post.meta.keywords}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.meta.description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://yourdomain.com/blog/${post.slug}.html">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${post.meta.description}">
    
    <!-- Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${post.title}",
        "description": "${post.meta.description}",
        "author": {
            "@type": "Person",
            "name": "${post.author}"
        },
        "datePublished": "${post.date}",
        "publisher": {
            "@type": "Organization",
            "name": "AI Blogger"
        }
    }
    </script>
    
    <!-- Styles -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
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
                <header class="mb-5">
                    <h1 class="display-4 fw-bold">${post.title}</h1>
                    <div class="d-flex align-items-center text-muted mt-3">
                        <span class="me-3"><i class="fas fa-user me-1"></i> ${post.author}</span>
                        <span class="me-3"><i class="fas fa-calendar me-1"></i> ${post.date}</span>
                        <span><i class="fas fa-clock me-1"></i> ${post.readTime}</span>
                    </div>
                    ${post.tags.length ? `<div class="mt-3">${post.tags.map(tag => `<span class="badge bg-secondary me-2">${tag}</span>`).join('')}</div>` : ''}
                </header>
                
                <div class="content">
                    ${post.content}
                </div>
                
                <footer class="mt-5 pt-4 border-top">
                    <div class="d-flex justify-content-between">
                        <a href="../blog-listing.html" class="btn btn-outline-primary">
                            <i class="fas fa-arrow-left me-2"></i>Back to Articles
                        </a>
                        <button onclick="window.print()" class="btn btn-outline-secondary">
                            <i class="fas fa-print me-2"></i>Print
                        </button>
                    </div>
                </footer>
            </div>
            
            <div class="col-lg-4">
                <div id="tableOfContents" class="toc-container"></div>
            </div>
        </div>
    </article>
    
    <footer class="bg-dark text-white py-4 mt-5">
        <div class="container text-center">
            <p>&copy; 2024 AI Blogger Pro</p>
        </div>
    </footer>
    
    <script src="../assets/js/main.js"></script>
    <script>
        // Initialize table of contents
        const toc = window.bloggerApp?.generateTableOfContents('articleContent');
        if (toc) {
            window.bloggerApp.renderTableOfContents(toc, 'tableOfContents');
        }
    </script>
</body>
</html>`;
    }

    downloadHTMLFile(content, filename) {
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

    saveToLocalStorage(blogPost) {
        let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        posts.unshift(blogPost); // Add to beginning
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // Update sitemap
        this.updateSitemap(posts);
    }

    updateSitemap(posts) {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://yourdomain.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    ${posts.map(post => `
    <url>
        <loc>https://yourdomain.com/blog/${post.slug}.html</loc>
        <lastmod>${post.date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    `).join('')}
</urlset>`;

        // Create downloadable sitemap
        const blob = new Blob([sitemap], { type: 'application/xml' });
        localStorage.setItem('sitemap.xml', URL.createObjectURL(blob));
    }

    showLoading(show) {
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            if (show) {
                generateBtn.innerHTML = '<span class="loading"></span> Generating...';
                generateBtn.disabled = true;
            } else {
                generateBtn.innerHTML = '<i class="fas fa-magic me-2"></i> Generate with AI';
                generateBtn.disabled = false;
            }
        }
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Initialize AI Writer
document.addEventListener('DOMContentLoaded', () => {
    window.aiWriter = new AIWriter();
});
