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
    
    // Window controls
    if (draggableWindow) {
        const dots = draggableWindow.querySelectorAll('.code-dots span');
        if (dots.length >= 3) {
            const [closeBtn, minBtn, maxBtn] = dots;

            closeBtn.addEventListener('click', () => {
                // Create confirmation modal
                const modal = document.createElement('div');
                modal.className = 'close-confirmation-modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <h3>Close Code Window?</h3>
                        <p>Are you sure you want to close the code window? It won't reappear for 1 minute.</p>
                        <div class="modal-buttons">
                            <button class="btn-confirm">Yes, Close</button>
                            <button class="btn-cancel">Cancel</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Add cursor interactions to modal buttons
                if (window.innerWidth > 768 && !('ontouchstart' in window)) {
                    const confirmBtn = modal.querySelector('.btn-confirm');
                    const cancelBtn = modal.querySelector('.btn-cancel');
                    
                    confirmBtn.addEventListener('mouseenter', () => setCursor('button-magnetic', confirmBtn));
                    confirmBtn.addEventListener('mouseleave', () => setCursor(''));
                    cancelBtn.addEventListener('mouseenter', () => setCursor('button-magnetic', cancelBtn));
                    cancelBtn.addEventListener('mouseleave', () => setCursor(''));
                }
                
                // Handle confirmation
                modal.querySelector('.btn-confirm').addEventListener('click', () => {
                    draggableWindow.style.display = 'none';
                    modal.remove();
                    
                    // Set timer for 1 minute before allowing reopen
                    setTimeout(() => {
                        // Create reopen button after 1 minute
                        const reopenBtn = document.createElement('button');
                        reopenBtn.className = 'reopen-window-btn';
                        reopenBtn.innerHTML = `
                            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/>
                                <path d="M8 10h8v4H8v-4z"/>
                            </svg>`;
                        reopenBtn.title = 'Reopen code window';
                        if (hero) {
                            hero.append(reopenBtn);
                        }
                        
                        reopenBtn.addEventListener('click', () => {
                            draggableWindow.style.display = '';
                            reopenBtn.remove();
                        });
                        
                        // Add cursor interaction for reopen button
                        if (window.innerWidth > 768 && !('ontouchstart' in window)) {
                            reopenBtn.addEventListener('mouseenter', () => setCursor('button-magnetic', reopenBtn));
                            reopenBtn.addEventListener('mouseleave', () => setCursor(''));
                        }
                    }, 60000); // 1 minute = 60000ms
                });
                
                // Handle cancel
                modal.querySelector('.btn-cancel').addEventListener('click', () => {
                    modal.remove();
                });
                
                // Close on backdrop click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                    }
                });
            });

            minBtn.addEventListener('click', () => {
                draggableWindow.style.display = 'none';
                const restore = document.createElement('button');
                restore.className = 'restore-btn';
                restore.innerHTML = `
                    <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>restore_fill</title> <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="System" transform="translate(-240.000000, -240.000000)"> <g id="restore_fill" transform="translate(240.000000, 240.000000)"> <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero"> </path> <path d="M19,2.5 C20.325472,2.5 21.4100378,3.53153766 21.4946823,4.83562452 L21.5,5 L21.5,15 C21.5,16.325472 20.4684531,17.4100378 19.1643744,17.4946823 L19,17.5 L17.5,17.5 L17.5,19 C17.5,20.325472 16.4684531,21.4100378 15.1643744,21.4946823 L15,21.5 L5,21.5 C3.6745184,21.5 2.58996147,20.4684531 2.50531769,19.1643744 L2.5,19 L2.5,9 C2.5,7.6745184 3.53153766,6.58996147 4.83562452,6.50531769 L5,6.5 L6.5,6.5 L6.5,5 C6.5,3.6745184 7.53153766,2.58996147 8.83562452,2.50531769 L9,2.5 L19,2.5 Z M14.5,9.5 L5.5,9.5 L5.5,18.5 L14.5,18.5 L14.5,9.5 Z M18.5,5.5 L9.5,5.5 L9.5,6.5 L15,6.5 L15.1643744,6.50531769 C16.4141165,6.58643465 17.4135646,7.58587462 17.4946823,8.83562452 L17.5,9 L17.5,14.5 L18.5,14.5 L18.5,5.5 Z" id="形状" fill="#ffffff"> </path> </g> </g> </g> </g></svg>`;
                restore.title = 'Restore window';
                if (hero) {
                    hero.append(restore);
                }
                restore.addEventListener('click', () => {
                    draggableWindow.style.display = '';
                    restore.remove();
                });
                
                // Add cursor interaction for restore button
                if (window.innerWidth > 768 && !('ontouchstart' in window)) {
                    restore.addEventListener('mouseenter', () => setCursor('button-magnetic', restore));
                    restore.addEventListener('mouseleave', () => setCursor(''));
                }
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
        let isFullscreen = false;

        // Track mouse with requestAnimationFrame for better performance
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Monitor fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            isFullscreen = !!document.fullscreenElement;
            
            if (isFullscreen) {
                // Hide custom cursor and restore normal cursor in fullscreen
                cursor.style.display = 'none';
                document.body.style.cursor = 'auto';
                document.documentElement.style.cursor = 'auto';
                style.textContent = `
                    * { cursor: auto !important; }
                    html, body { cursor: auto !important; }
                `;
            } else {
                // Restore custom cursor when exiting fullscreen
                cursor.style.display = 'block';
                document.body.style.cursor = 'none';
                document.documentElement.style.cursor = 'none';
                style.textContent = `
                    *, *::before, *::after { cursor: none !important; }
                    html, body { cursor: none !important; }
                `;
            }
        });

        // High-performance cursor following
        function updateCursor() {
            if (!isSnapped && !isFullscreen) {
                cursor.style.left = mouseX + 'px';
                cursor.style.top = mouseY + 'px';
            }
            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        // Cursor state management
        function setCursor(state, element = null) {
            // Don't change cursor in fullscreen mode
            if (isFullscreen) return;
            
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
                
            } else if (state === 'window-control' && element) {
                const rect = element.getBoundingClientRect();
                isSnapped = true;
                currentElement = element;
                
                cursor.className = 'custom-cursor window-control';
                
                cursor.style.left = (rect.left + rect.width / 2) + 'px';
                cursor.style.top = (rect.top + rect.height / 2) + 'px';
                
            } else {
                // Smooth exit transition
                if (cursor.classList.contains('nav-magnetic') || 
                    cursor.classList.contains('button-magnetic') ||
                    cursor.classList.contains('window-control')) {
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

        // Window control events
        document.querySelectorAll('.code-dots span').forEach(control => {
            control.addEventListener('mouseenter', () => setCursor('window-control', control));
            control.addEventListener('mouseleave', () => setCursor(''));
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
