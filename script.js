document.addEventListener('DOMContentLoaded', function() {
    // --- BEGIN: Inject CSS for flip animation ---
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        .draggable-window {
            /* transform is for dragging, set by JS */
            transform: translate(var(--x-offset, 0px), var(--y-offset, 0px));
            perspective: 1000px;       /* add 3D perspective */
            /* position: relative; /* Ensure this is set if not already, for child absolute positioning */
            /* display: flex; flex-direction: column; /* Recommended for layout with handle */
        }

        .flip-content-area {
            position: relative; /* For positioning back-face */
            width: 100%;
            /* height: 100%; /* Or flex-grow: 1 if parent is flex column */
            transition: transform 0.6s ease-in-out;
            transform-style: preserve-3d;
            /* background: #2d2d2d; /* Optional: if the area itself needs a base background */
        }

        .draggable-window.flipped .flip-content-area {
            transform: rotateY(180deg);
        }

        .flip-front-face {
            /* This will contain the original window content */
            width: 100%;
            height: 100%; /* Ensures it fills .flip-content-area if that area has a defined height */
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden; /* For Safari */
            /* background: #2d2d2d; /* Or inherit from parent */
        }

        .flip-back-face {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden; /* For Safari */
            transform: rotateY(180deg);
            background: #282c34; /* Blank back face color, adjust as needed */
            display: flex;               /* center and show VM canvas */
            align-items: center;
            justify-content: center;
            overflow: hidden;            /* prevent overflow */
            /* display: flex; align-items: center; justify-content: center; /* For any text on back */
            /* content: ""; /* If you want to ensure it's rendered */
        }
    `;
    document.head.appendChild(styleSheet);
    // --- END: Inject CSS for flip animation ---

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

    // --- BEGIN: DOM manipulation for flip structure ---
    if (draggableWindow && draggableHandle) {
        const flipContentArea = document.createElement('div');
        flipContentArea.className = 'flip-content-area';

        const flipFrontFace = document.createElement('div');
        flipFrontFace.className = 'flip-front-face';

        const flipBackFace = document.createElement('div');
        flipBackFace.className = 'flip-back-face';

        // Collect nodes to move (all direct children of draggableWindow except draggableHandle)
        const childrenToMove = [];
        draggableWindow.childNodes.forEach(child => {
            // Check if it's an element node and not the handle or the injected stylesheet
            if (child.nodeType === Node.ELEMENT_NODE && child !== draggableHandle && child !== styleSheet) {
                childrenToMove.push(child);
            }
        });

        // Move them into flipFrontFace
        childrenToMove.forEach(child => {
            flipFrontFace.appendChild(child);
        });

        flipContentArea.appendChild(flipFrontFace);
        flipContentArea.appendChild(flipBackFace);

        // add a div for our VM
        const vmContainer = document.createElement('div');
        vmContainer.id = 'vmContainer';
        vmContainer.style.cssText = 'width:100%;height:100%;';
        flipBackFace.appendChild(vmContainer);

        draggableWindow.appendChild(flipContentArea);

        // Note: For proper layout (handle above content area), your existing CSS for .draggable-window
        // might need to be 'display: flex; flex-direction: column;'.
        // And .flip-content-area might need 'flex-grow: 1; overflow: auto;'.
        // This script sets up the elements; precise layout depends on your broader CSS.
    }
    // --- END: DOM manipulation for flip structure ---

    let isDragging = false,
        currentX = 0,
        currentY = 0,
        initialX, initialY,
        xOffset = 0,
        yOffset = 0;

    // --- BEGIN: Initialize CSS variables for draggable window ---
    if (draggableWindow) {
        draggableWindow.style.setProperty('--x-offset', '0px');
        draggableWindow.style.setProperty('--y-offset', '0px');
    }
    // --- END: Initialize CSS variables for draggable window ---

    draggableHandle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

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
        // Ensure heroRect and headerH are valid if hero/header can be null
        const heroRect = hero ? hero.getBoundingClientRect() : { bottom: window.innerHeight };
        const headerH = header ? header.offsetHeight : 0;
        const vw = window.innerWidth;

        // compute tentative offsets
        let newX = e.clientX - initialX;
        let newY = e.clientY - initialY;

        // clamp X within viewport
        const boxLeft = windowRect.left - xOffset;
        const minX    = -boxLeft;
        const maxX    = vw - windowRect.width - boxLeft;
        currentX      = Math.max(minX, Math.min(maxX, newX));

        // clamp Y between header bottom and hero bottom
        const dy       = newY - yOffset; // This dy is fine, it's for clamping logic
        const minDY    = headerH - windowRect.top;
        const maxDY    = heroRect.bottom - windowRect.bottom;
        // The currentY calculation needs to be relative to its initial drag point, not absolute yOffset
        // currentY = yOffset + Math.max(minDY, Math.min(maxDY, dy)); // Original logic might be complex with new transform
        // Simpler: newY is the target for yOffset, then clamp currentY based on window position
        currentY = e.clientY - initialY; // This is the new yOffset based on mouse

        // Clamp currentY (which is the new yOffset)
        const potentialTop = windowRect.top - yOffset + currentY; // current window top if this currentY is applied
        const potentialBottom = windowRect.bottom - yOffset + currentY; // current window bottom

        if (potentialTop < headerH) {
            currentY = yOffset + headerH - windowRect.top;
        } else if (potentialBottom > heroRect.bottom) {
            currentY = yOffset + heroRect.bottom - windowRect.bottom;
        }


        xOffset = currentX;
        yOffset = currentY;
        // draggableWindow.style.transform = `translate(${currentX}px, ${currentY}px)`; // Old line
        // --- BEGIN: Update CSS variables for transform ---
        if (draggableWindow) {
            draggableWindow.style.setProperty('--x-offset', `${currentX}px`);
            draggableWindow.style.setProperty('--y-offset', `${currentY}px`);
        }
        // --- END: Update CSS variables for transform ---
    }

    function dragEnd() {
        isDragging = false;
    }

    window.addEventListener('resize', () => {
        // draggableWindow.style.transform = 'translate(0,0)'; // Old line
        xOffset = 0; // Reset JS state variables
        yOffset = 0;
        // --- BEGIN: Reset CSS variables and flip state on resize ---
        if (draggableWindow) {
            draggableWindow.style.setProperty('--x-offset', '0px');
            draggableWindow.style.setProperty('--y-offset', '0px');
            draggableWindow.classList.remove('flipped'); // Reset flip state
        }
        // --- END: Reset CSS variables and flip state on resize ---
    });
    
    // --- New: hide on load if previously closed ---
    const isClosed = document.cookie.split(';').some(c => c.trim().startsWith('heroClosed='));
    if (isClosed && draggableWindow) draggableWindow.style.display = 'none';

    // --- New: restore flip state on load ---
    const isFlipped = document.cookie.split(';').some(c => c.trim().startsWith('heroFlipped=true'));
    if (isFlipped && draggableWindow) draggableWindow.classList.add('flipped');

    // --- New: expose reopen command ---
    window.openWindow = function() {
        // clear cookie and show window
        document.cookie = 'heroClosed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        if (draggableWindow) draggableWindow.style.display = '';
    };

    // expose emulator var
    let emulator;

    // Window controls
    if (draggableWindow) { // Ensure draggableWindow exists before querySelectorAll
        const dots = draggableWindow.querySelectorAll('.code-dots span');
        if (dots.length >= 3) { // Ensure all three buttons are found
            const [closeBtn, minBtn, maxBtn] = dots;

            closeBtn.addEventListener('click', () => {
                // store closed state in cookie
                document.cookie = 'heroClosed=true; path=/';
                draggableWindow.style.display = 'none';
            });

            minBtn.addEventListener('click', () => {
                // hide window
                draggableWindow.style.display = 'none';
                // create restore button
                const restore = document.createElement('button');
                restore.className = 'restore-btn';
                restore.innerHTML = `
                    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 2h12v12H2z" stroke="#e6e6e6" fill="none"/>
                      <path d="M4 8l3-2v4l-3-2z" fill="#e6e6e6"/>
                    </svg>`;
                if (hero) { // Ensure hero element exists
                    hero.append(restore);
                }
                restore.addEventListener('click', () => {
                    draggableWindow.style.display = '';
                    restore.remove();
                });
            });

            maxBtn.addEventListener('click', () => {
              // Fullscreen functionality
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

        // Add flip functionality to a dedicated play/run button
        const runButton = draggableWindow.querySelector('.run-btn'); 
        if (runButton) {
            runButton.addEventListener('click', () => {
                const nowFlipped = draggableWindow.classList.toggle('flipped');
                // Persist flip state in cookie
                if (nowFlipped) {
                    document.cookie = 'heroFlipped=true; path=/';
                } else {
                    document.cookie = 'heroFlipped=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
                }

                // initialize VM once when flipped
                if (nowFlipped && !emulator && window.V86Starter) {
                  emulator = new V86Starter({
                    wasm_path: "https://unpkg.com/v86/build/v86.wasm",
                    memory_size: 64 * 1024 * 1024,
                    bios: { url: "https://unpkg.com/v86/build/bios.bin" },
                    vga_bios: { url: "https://unpkg.com/v86/build/vgabios.bin" },
                    cdrom: { url: "https://archive.org/download/archlinux-2023.04.01/archboot.iso" },
                    network_relay_url: "wss://relay.widgetry.org/",
                    screen_container: document.getElementById("vmContainer")
                  });
                }
            });
        } else {
            console.warn('Run button with selector ".run-btn" not found inside .draggable-window.');
        }
    }
    // --- END: Add flip functionality to a dedicated play/run button ---
});
