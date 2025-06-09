document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Copy functionality
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const codeSnippet = btn.previousElementSibling;
            const text = codeSnippet.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = 'Copy';
                }, 2000);
            });
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Dragging functionality for code window
    const draggableWindow = document.querySelector('.draggable-window');
    const draggableHandle = document.querySelector('.draggable-handle');
    const hero = document.querySelector('.hero');

    let isDragging = false,
        currentX = 0,
        currentY = 0,
        initialX, initialY,
        xOffset = 0,
        yOffset = 0;

    if (draggableHandle) {
        draggableHandle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    }

    function dragStart(e) {
        if (draggableHandle.contains(e.target)) {
            isDragging = true;
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const windowRect = draggableWindow.getBoundingClientRect();
        const heroRect = hero ? hero.getBoundingClientRect() : { bottom: window.innerHeight };
        const headerH = header ? header.offsetHeight : 0;
        const vw = window.innerWidth;

        let newX = e.clientX - initialX;
        let newY = e.clientY - initialY;

        const boxLeft = windowRect.left - xOffset;
        const minX = -boxLeft;
        const maxX = vw - windowRect.width - boxLeft;
        currentX = Math.max(minX, Math.min(maxX, newX));

        currentY = e.clientY - initialY;

        const potentialTop = windowRect.top - yOffset + currentY;
        const potentialBottom = windowRect.bottom - yOffset + currentY;

        if (potentialTop < headerH) {
            currentY = yOffset + headerH - windowRect.top;
        } else if (potentialBottom > heroRect.bottom) {
            currentY = yOffset + heroRect.bottom - windowRect.bottom;
        }

        xOffset = currentX;
        yOffset = currentY;
        draggableWindow.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }

    function dragEnd() {
        isDragging = false;
    }

    window.addEventListener('resize', () => {
        draggableWindow.style.transform = 'translate(0,0)';
        xOffset = 0;
        yOffset = 0;
    });
    
    // Hide on load if previously closed
    const isClosed = document.cookie.split(';').some(c => c.trim().startsWith('heroClosed='));
    if (isClosed && draggableWindow) draggableWindow.style.display = 'none';

    // Expose reopen command
    window.openWindow = function() {
        document.cookie = 'heroClosed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        if (draggableWindow) draggableWindow.style.display = '';
    };

    // Window controls
    if (draggableWindow) {
        const dots = draggableWindow.querySelectorAll('.code-dots span');
        if (dots.length >= 3) {
            const [closeBtn, minBtn, maxBtn] = dots;

            closeBtn.addEventListener('click', () => {
                document.cookie = 'heroClosed=true; path=/';
                draggableWindow.style.display = 'none';
            });

            minBtn.addEventListener('click', () => {
                draggableWindow.style.display = 'none';
                const restore = document.createElement('button');
                restore.className = 'restore-btn';
                restore.innerHTML = `
                    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 2h12v12H2z" stroke="#e6e6e6" fill="none"/>
                      <path d="M4 8l3-2v4l-3-2z" fill="#e6e6e6"/>
                    </svg>`;
                if (hero) {
                    hero.append(restore);
                }
                restore.addEventListener('click', () => {
                    draggableWindow.style.display = '';
                    restore.remove();
                });
            });

            maxBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    draggableWindow.requestFullscreen().catch(err => {
                        console.warn('Fullscreen request failed:', err.message); 
                    });
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            });
        }
    }
    
    // Custom Cursor System
    function initCustomCursor() {
        // Force hide default cursor
        document.body.style.cursor = 'none';
        document.documentElement.style.cursor = 'none';
        
        // Add styles to ensure cursor is hidden
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after { cursor: none !important; }
            html, body { cursor: none !important; }
        `;
        document.head.appendChild(style);

        // Create cursor
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let mouseX = 0;
        let mouseY = 0;
        let isSnapped = false;
        let currentElement = null;

        // Track mouse with requestAnimationFrame for better performance
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // High-performance cursor following
        function updateCursor() {
            if (!isSnapped) {
                cursor.style.left = mouseX + 'px';
                cursor.style.top = mouseY + 'px';
            }
            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        // Cursor state management
        function setCursor(state, element = null) {
            if (state === 'button-magnetic' && element) {
                const rect = element.getBoundingClientRect();
                isSnapped = true;
                currentElement = element;
                
                cursor.className = 'custom-cursor button-magnetic';
                cursor.style.setProperty('--btn-width', rect.width + 'px');
                cursor.style.setProperty('--btn-height', rect.height + 'px');
                
                let buttonText = element.textContent.trim();
                buttonText = buttonText.replace(/[📦📖⚡🎨🔧🚀]/g, '').trim();
                cursor.style.setProperty('--btn-text', `"${buttonText}"`);
                
                cursor.style.left = (rect.left + rect.width / 2) + 'px';
                cursor.style.top = (rect.top + rect.height / 2) + 'px';
                
                element.style.opacity = '0';
                element.style.transition = 'opacity 0.2s ease';
                
            } else if (state === 'nav-magnetic' && element) {
                const rect = element.getBoundingClientRect();
                isSnapped = true;
                currentElement = element;
                
                cursor.className = 'custom-cursor nav-magnetic';
                cursor.style.setProperty('--nav-width', (rect.width + 20) + 'px');
                
                const navText = element.textContent.trim();
                cursor.style.setProperty('--nav-text', `"${navText}"`);
                
                cursor.style.left = (rect.left + rect.width / 2) + 'px';
                cursor.style.top = (rect.top + rect.height / 2) + 'px';
                
            } else {
                // Smooth exit transition
                if (cursor.classList.contains('nav-magnetic') || 
                    cursor.classList.contains('button-magnetic')) {
                    cursor.style.transition = 'all 0.15s cubic-bezier(0.23, 1, 0.32, 1)';
                    
                    setTimeout(() => {
                        cursor.style.transition = 'width 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.25s ease';
                    }, 150);
                }
                
                cursor.className = `custom-cursor ${state}`;
                isSnapped = false;
                currentElement = null;
                
                cursor.style.removeProperty('--btn-text');
                cursor.style.removeProperty('--nav-text');
                
                document.querySelectorAll('[style*="opacity: 0"]').forEach(el => {
                    el.style.opacity = '1';
                });
            }
        }

        // Button events
        document.querySelectorAll('.btn-primary, .btn-outline, .tab-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => setCursor('button-magnetic', btn));
            btn.addEventListener('mouseleave', () => setCursor(''));
        });

        // Logo events (including GitHub logo)
        document.querySelectorAll('.nav-logo, .github-link').forEach(logo => {
            logo.addEventListener('mouseenter', () => setCursor('logo'));
            logo.addEventListener('mouseleave', () => setCursor(''));
        });

        // Nav events (excluding GitHub logo)
        document.querySelectorAll('.nav-links a:not(.github-link)').forEach(link => {
            link.addEventListener('mouseenter', () => setCursor('nav-magnetic', link));
            link.addEventListener('mouseleave', () => setCursor(''));
        });

        // Text cursor events
        document.querySelectorAll('p, h1, h2, h3, h4, li').forEach(text => {
            text.addEventListener('mouseenter', () => setCursor('text'));
            text.addEventListener('mouseleave', () => setCursor(''));
        });

        // Hover events for cards and interactive elements
        document.querySelectorAll('.feature-card, .syntax-card, code, .code-window').forEach(el => {
            el.addEventListener('mouseenter', () => setCursor('hover'));
            el.addEventListener('mouseleave', () => setCursor(''));
        });

        // Update snapped cursor position on scroll/resize
        function updateSnappedPosition() {
            if (isSnapped && currentElement) {
                const rect = currentElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                cursor.style.left = centerX + 'px';
                cursor.style.top = centerY + 'px';
            }
        }

        window.addEventListener('scroll', updateSnappedPosition);
        window.addEventListener('resize', updateSnappedPosition);
    }

    // Initialize cursor on desktop only
    if (window.innerWidth > 768 && !('ontouchstart' in window)) {
        initCustomCursor();
    }
});
