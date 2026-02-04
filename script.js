// ============================================
// Theme Toggle Functionality
// ============================================
(function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply saved theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
})();

// ============================================
// Navigation Generation
// ============================================
(function() {
    const navList = document.getElementById('navList');
    const mainContent = document.getElementById('mainContent');
    const docContent = document.getElementById('docContent');

    // Check if elements exist before proceeding
    if (!navList || !docContent) {
        return;
    }

    function generateNavigation() {
        const headings = docContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        if (headings.length === 0) {
            navList.innerHTML = '<li><a href="index.html">الصفحة الرئيسية</a></li>';
            return;
        }

        navList.innerHTML = '';
        let navItems = [];

        headings.forEach((heading, index) => {
            // Create anchor ID if it doesn't exist
            let anchorId = heading.id;
            if (!anchorId) {
                anchorId = `section-${index}`;
                heading.id = anchorId;
            }

            // Add section anchor for smooth scrolling
            const anchor = document.createElement('span');
            anchor.className = 'section-anchor';
            anchor.id = anchorId;
            heading.parentNode.insertBefore(anchor, heading);

            // Create navigation item
            const level = parseInt(heading.tagName.charAt(1));
            const navItem = document.createElement('li');
            const link = document.createElement('a');
            
            link.href = `#${anchorId}`;
            link.textContent = heading.textContent.trim();
            link.className = `nav-level-${level}`;
            
            navItem.appendChild(link);
            navItems.push({ level, navItem, link, anchorId });
        });

        // Build hierarchical navigation
        const navStack = [];
        navItems.forEach(({ level, navItem, link, anchorId }) => {
            // Remove items from stack that are at same or higher level
            while (navStack.length > 0 && navStack[navStack.length - 1].level >= level) {
                navStack.pop();
            }

            // Add to appropriate parent or root
            if (navStack.length === 0) {
                navList.appendChild(navItem);
            } else {
                const parent = navStack[navStack.length - 1].navItem;
                let parentList = parent.querySelector('ul');
                if (!parentList) {
                    parentList = document.createElement('ul');
                    parentList.className = 'nav-list';
                    parent.appendChild(parentList);
                }
                parentList.appendChild(navItem);
            }

            navStack.push({ level, navItem, link, anchorId });
        });

        // Add click handlers for smooth scrolling
        navItems.forEach(({ link, anchorId }) => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.getElementById(anchorId);
                if (target) {
                    const headerOffset = 120;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update active state
                    updateActiveNav(anchorId);
                }
            });
        });
    }

    function updateActiveNav(activeId) {
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }

    // Update active nav on scroll
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            const headings = docContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const headerOffset = 140;
            let current = '';

            headings.forEach(heading => {
                const headingTop = heading.getBoundingClientRect().top;
                if (headingTop <= headerOffset) {
                    current = heading.id || `section-${Array.from(headings).indexOf(heading)}`;
                }
            });

            if (current) {
                updateActiveNav(current);
            }
        }, 100);
    });

    // Generate navigation when content is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generateNavigation);
    } else {
        generateNavigation();
    }

    // Re-generate navigation if content changes (only for significant changes)
    const observer = new MutationObserver(function(mutations) {
        let shouldRegenerate = false;
        mutations.forEach(function(mutation) {
            // Only regenerate if headings are added/removed, not for text changes
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.tagName && node.tagName.match(/^H[1-6]$/))) {
                        shouldRegenerate = true;
                    }
                });
            }
            if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.tagName && node.tagName.match(/^H[1-6]$/))) {
                        shouldRegenerate = true;
                    }
                });
            }
        });
        if (shouldRegenerate) {
            // Debounce to prevent multiple regenerations
            clearTimeout(regenerateTimeout);
            regenerateTimeout = setTimeout(generateNavigation, 300);
        }
    });

    let regenerateTimeout;
    if (docContent) {
        observer.observe(docContent, {
            childList: true,
            subtree: true
        });
    }
})();

// ============================================
// Code Block Copy Functionality
// ============================================
(function() {
    const docContent = document.getElementById('docContent');
    
    // Check if element exists
    if (!docContent) {
        return;
    }

    function addCopyButtons() {
        const codeBlocks = docContent.querySelectorAll('pre code');
        
        codeBlocks.forEach(function(codeBlock) {
            const pre = codeBlock.parentElement;
            
            // Skip if button already exists
            if (pre.querySelector('.copy-code-btn')) {
                return;
            }

            // Wrap pre in container
            const container = document.createElement('div');
            container.className = 'code-block-container';
            pre.parentNode.insertBefore(container, pre);
            container.appendChild(pre);

            // Create copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.textContent = 'نسخ الكود';
            copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
            
            copyBtn.addEventListener('click', function() {
                const text = codeBlock.textContent;
                copyToClipboard(text);
                showCopyNotification();
            });

            container.appendChild(copyBtn);
        });
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function(err) {
                console.error('Failed to copy:', err);
                fallbackCopyToClipboard(text);
            });
        } else {
            fallbackCopyToClipboard(text);
        }
    }

    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
    }

    function showCopyNotification() {
        const notification = document.getElementById('copyNotification');
        notification.classList.add('show');
        
        setTimeout(function() {
            notification.classList.remove('show');
        }, 2000);
    }

    // Add copy buttons when content is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCopyButtons);
    } else {
        addCopyButtons();
    }

    // Watch for new code blocks (debounced)
    let copyButtonTimeout;
    const observer = new MutationObserver(function(mutations) {
        let hasNewCodeBlocks = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.tagName === 'PRE' || (node.querySelector && node.querySelector('pre')))) {
                        hasNewCodeBlocks = true;
                    }
                });
            }
        });
        if (hasNewCodeBlocks) {
            clearTimeout(copyButtonTimeout);
            copyButtonTimeout = setTimeout(addCopyButtons, 300);
        }
    });

    if (docContent) {
        observer.observe(docContent, {
            childList: true,
            subtree: true
        });
    }
})();

// ============================================
// Content Processing Helper
// ============================================
function processDocumentationContent(content) {
    const docContent = document.getElementById('docContent');
    
    if (!docContent) {
        return;
    }
    
    // Insert content exactly as provided
    docContent.innerHTML = content;
    
    // Process and format the content
    processTables();
    processCodeBlocks();
    processHeadings();
    
    // Regenerate navigation and copy buttons
    setTimeout(function() {
        const navEvent = new Event('contentUpdated');
        document.dispatchEvent(navEvent);
        
        // Trigger navigation regeneration
        if (typeof generateNavigation === 'function') {
            generateNavigation();
        }
        
        // Trigger copy button addition
        const codeBlocks = docContent.querySelectorAll('pre code');
        if (codeBlocks.length > 0) {
            const copyEvent = new Event('codeBlocksAdded');
            document.dispatchEvent(copyEvent);
        }
    }, 100);
}

function processTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(function(table) {
        if (!table.querySelector('thead')) {
            const firstRow = table.querySelector('tr');
            if (firstRow) {
                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');
                thead.appendChild(firstRow);
                
                const rows = Array.from(table.querySelectorAll('tr'));
                rows.slice(1).forEach(function(row) {
                    tbody.appendChild(row);
                });
                
                table.innerHTML = '';
                table.appendChild(thead);
                if (tbody.children.length > 0) {
                    table.appendChild(tbody);
                }
            }
        }
    });
}

function processCodeBlocks() {
    const pres = document.querySelectorAll('pre');
    pres.forEach(function(pre) {
        if (!pre.querySelector('code')) {
            const code = document.createElement('code');
            code.textContent = pre.textContent;
            pre.textContent = '';
            pre.appendChild(code);
        }
    });
}

function processHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(function(heading, index) {
        if (!heading.id) {
            heading.id = `section-${index}`;
        }
    });
}

// Export function for external use
if (typeof window !== 'undefined') {
    window.processDocumentationContent = processDocumentationContent;
}

// ============================================
// Prevent Unnecessary Reloads
// ============================================
(function() {
    // Prevent form submissions from reloading
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.tagName === 'FORM' && !form.hasAttribute('data-allow-reload')) {
            e.preventDefault();
        }
    });

    // Optimize scroll performance
    let ticking = false;
    function updateOnScroll() {
        // Scroll handling code here
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    }, { passive: true });

    // Prevent multiple rapid clicks on links
    const links = document.querySelectorAll('a[href]');
    links.forEach(function(link) {
        let lastClickTime = 0;
        link.addEventListener('click', function(e) {
            const currentTime = Date.now();
            // Prevent rapid double-clicks
            if (currentTime - lastClickTime < 300) {
                e.preventDefault();
                return false;
            }
            lastClickTime = currentTime;
        });
    });

    // Store scroll position before navigation
    window.addEventListener('beforeunload', function() {
        sessionStorage.setItem('scrollPosition', window.pageYOffset);
    });

    // Restore scroll position if available
    window.addEventListener('load', function() {
        const scrollPosition = sessionStorage.getItem('scrollPosition');
        if (scrollPosition && window.location.hash === '') {
            setTimeout(function() {
                window.scrollTo(0, parseInt(scrollPosition));
            }, 100);
        }
    });
})();

// ============================================
// Mobile Menu Toggle
// ============================================
(function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 968) {
                if (!mainNav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });

        // Close menu when clicking on a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 968) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            });
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 968) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            }, 250);
        });
    }
})();