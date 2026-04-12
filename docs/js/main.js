// ============================================================================
// REDZONERROR - MAIN JAVASCRIPT
// Interactive animations and functionality
// ============================================================================

(function() {
    'use strict';

    // ========================================================================
    // NAVIGATION
    // ========================================================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ========================================================================
    // TYPING ANIMATION
    // ========================================================================
    const typingText = document.getElementById('typingText');
    const texts = [
        'Full Stack Developer',
        'Mobile App Developer',
        'Software Engineer',
        'Database Expert',
        'Blockchain Developer',
        'Security Researcher',
        'Automation Specialist'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500; // Pause before next word
        }

        setTimeout(type, typingSpeed);
    }

    // Start typing animation
    type();

    // ========================================================================
    // FETCH GITHUB REPOSITORIES
    // ========================================================================
    async function fetchGitHubRepos() {
        const projectsGrid = document.getElementById('projectsGrid');
        
        try {
            // Fetch all repositories
            const response = await fetch('https://api.github.com/users/RedZONERROR/repos?sort=updated&per_page=100');
            const repos = await response.json();
            
            // Calculate statistics
            const publicRepos = repos.filter(repo => !repo.fork && !repo.private);
            const totalStars = publicRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
            const totalForks = publicRepos.reduce((sum, repo) => sum + repo.forks_count, 0);
            
            // Fetch private repo count from stats file (updated by GitHub Actions)
            let privateCount = 0;
            try {
                const statsResponse = await fetch('./stats.json');
                if (statsResponse.ok) {
                    const stats = await statsResponse.json();
                    privateCount = stats.privateRepos || 0;
                }
            } catch (error) {
                console.log('Stats file not found, using default value');
                // Fallback: Manual count if stats.json doesn't exist yet
                privateCount = 15; // Update this number manually as fallback
            }
            
            // Update statistics
            document.getElementById('publicCount').textContent = publicRepos.length;
            document.getElementById('privateCount').textContent = privateCount;
            document.getElementById('totalStars').textContent = totalStars;
            document.getElementById('totalForks').textContent = totalForks;
            
            // Sort by stars
            publicRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            
            if (publicRepos.length === 0) {
                projectsGrid.innerHTML = '<p class="loading">No public repositories found.</p>';
                return;
            }
            
            projectsGrid.innerHTML = '';
            
            publicRepos.forEach(repo => {
                const card = document.createElement('div');
                card.className = 'project-card';
                
                // Get language icon
                const languageIcon = getLanguageIcon(repo.language);
                
                card.innerHTML = `
                    <div class="project-icon">
                        <i class="${languageIcon}"></i>
                    </div>
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available'}</p>
                    <div class="project-meta">
                        ${repo.language ? `<span><i class="fas fa-circle"></i> ${repo.language}</span>` : ''}
                        <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="project-link">
                        View Repository <i class="fas fa-arrow-right"></i>
                    </a>
                `;
                
                projectsGrid.appendChild(card);
            });
            
            // Animate cards
            document.querySelectorAll('.project-card').forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            });
            
        } catch (error) {
            console.error('Error fetching repositories:', error);
            projectsGrid.innerHTML = '<p class="loading">Failed to load repositories. Please visit <a href="https://github.com/RedZONERROR" target="_blank">GitHub</a> directly.</p>';
        }
    }

    function getLanguageIcon(language) {
        const icons = {
            'JavaScript': 'fab fa-js',
            'TypeScript': 'fab fa-js',
            'Python': 'fab fa-python',
            'Java': 'fab fa-java',
            'Kotlin': 'fab fa-android',
            'PHP': 'fab fa-php',
            'C': 'fas fa-code',
            'C++': 'fas fa-code',
            'HTML': 'fab fa-html5',
            'CSS': 'fab fa-css3-alt',
            'Shell': 'fas fa-terminal',
            'Lua': 'fas fa-code',
            'Solidity': 'fab fa-ethereum',
            'Go': 'fab fa-golang',
            'Rust': 'fas fa-code',
            'Ruby': 'fas fa-gem',
            'Swift': 'fab fa-swift',
            'Dart': 'fas fa-code'
        };
        
        return icons[language] || 'fas fa-code';
    }

    // Fetch repositories on page load
    fetchGitHubRepos();

    // ========================================================================
    // SMOOTH SCROLL
    // ========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================================================
    // INTERSECTION OBSERVER - ANIMATE ON SCROLL
    // ========================================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe skill categories
    document.querySelectorAll('.skill-category').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe project cards
    document.querySelectorAll('.project-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
        observer.observe(card);
    });

    // Observe contact cards
    document.querySelectorAll('.contact-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // ========================================================================
    // PARALLAX EFFECT
    // ========================================================================
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-background');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // ========================================================================
    // SKILL TAG HOVER EFFECT
    // ========================================================================
    document.querySelectorAll('.skill-tag').forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // ========================================================================
    // ACCESSIBILITY ENHANCEMENTS
    // ========================================================================
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Focus trap for mobile menu
    const focusableElements = navMenu.querySelectorAll('a, button');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    navMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    });

    // ========================================================================
    // PERFORMANCE OPTIMIZATION
    // ========================================================================
    let ticking = false;
    let lastScrollY = window.pageYOffset;

    window.addEventListener('scroll', () => {
        lastScrollY = window.pageYOffset;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Perform scroll-based animations here
                ticking = false;
            });
            ticking = true;
        }
    });

    // ========================================================================
    // CONSOLE MESSAGE
    // ========================================================================
    console.log('%cRedZONERROR', 'font-size: 24px; font-weight: bold; color: #000000;');
    console.log('%cFull Stack Developer | Software Engineer', 'font-size: 14px; color: #737373;');
    console.log('%cPortfolio: https://redzonerror.github.io/RedZONERROR/', 'font-size: 12px; color: #000000;');

    // ========================================================================
    // DYNAMIC COPYRIGHT YEAR
    // ========================================================================
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // ========================================================================
    // INITIALIZATION COMPLETE
    // ========================================================================
    console.log('%c✓ Portfolio initialized successfully', 'color: #000000; font-weight: bold;');

})();
