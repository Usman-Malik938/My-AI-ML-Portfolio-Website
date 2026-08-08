document.addEventListener('DOMContentLoaded', () => {
    // 1. Interactive Cursor Glow Background
    const glowEl = document.querySelector('.cursor-glow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth interpolation for the mouse glow
    function updateGlowPosition() {
        // Dampen the movements for a premium, heavy feel
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        
        if (glowEl) {
            glowEl.style.setProperty('--mouse-x', `${currentX}px`);
            glowEl.style.setProperty('--mouse-y', `${currentY}px`);
        }
        requestAnimationFrame(updateGlowPosition);
    }
    updateGlowPosition();

    // 2. Navigation Styling on Scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal & Skill Progress Animations (Intersection Observer)
    const revealOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Once it is shown, we can unobserve if we only want entrance-once animations
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Observe reveal elements
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .skill-item');
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Reviews Slider
    let currentSlide = 0;
    const slider = document.getElementById('reviewsSlider');
    const dots = document.querySelectorAll('.dot');
    const reviewCards = document.querySelectorAll('.review-card');
    const totalSlides = reviewCards.length;
    let autoSlideInterval;

    function goToSlide(n) {
        currentSlide = n;
        if (slider) {
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        updateDots();
    }

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }

    // Expose goToSlide globally to let HTML dot onclicks use it
    window.goToSlide = (n) => {
        goToSlide(n);
        resetAutoSlide();
    };

    // Auto-slide every 6 seconds
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 6000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    if (totalSlides > 0) {
        startAutoSlide();
    }

    // 5. Smart Project Video Autoplay (Autoplay when in viewport, pause when out)
    const projectVideos = document.querySelectorAll('.project-video-element');
    
    const videoObserverOptions = {
        root: null,
        threshold: 0.5 // Play when 50% of the video is visible
    };

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Autoplay when scrolled onto screen
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log('Video autoplay on scroll prevented:', error);
                    });
                }
            } else {
                // Pause when scrolled off screen
                video.pause();
            }
        });
    }, videoObserverOptions);

    projectVideos.forEach(video => {
        videoObserver.observe(video);
        
        const card = video.closest('.project-card');
        if (card) {
            // Mouseenter ensures it plays if hover interaction is detected
            card.addEventListener('mouseenter', () => {
                if (video.paused) {
                    video.play().catch(() => {});
                }
            });
        }
    });

    // 6. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 7. Custom AI Chatbot Widget Logic
    const chatbotBtn = document.getElementById('chatbotBtn');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotForm = document.getElementById('chatbotForm');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotMessages = document.getElementById('chatbotMessages');

    let isChatbotInitialized = false;

    // Toggle Chatbot Window
    if (chatbotBtn && chatbotContainer) {
        chatbotBtn.addEventListener('click', () => {
            chatbotContainer.classList.toggle('active');
            chatbotBtn.classList.toggle('active');
            
            if (chatbotContainer.classList.contains('active') && !isChatbotInitialized) {
                initializeChatbot();
            }
        });
    }

    if (chatbotClose && chatbotContainer && chatbotBtn) {
        chatbotClose.addEventListener('click', () => {
            chatbotContainer.classList.remove('active');
            chatbotBtn.classList.remove('active');
        });
    }

    // Initialize Chatbot with Welcome Message
    function initializeChatbot() {
        isChatbotInitialized = true;
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            appendBotMessage("Hi there! 👋 I'm a custom conversational AI agent built by Usman, running on his fine-tuned LLM inference pipeline.<br><br>Ask me anything about his AI/ML projects, skills, stock art, or how to get in touch!");
        }, 1000);
    }

    // Send Message Form
    if (chatbotForm) {
        chatbotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatbotInput.value.trim();
            if (!text) return;

            appendUserMessage(text);
            chatbotInput.value = '';

            handleBotResponse(text);
        });
    }

    // Append User Message to Chat
    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg user';
        msgDiv.textContent = text;
        chatbotMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    // Append Bot Message to Chat
    function appendBotMessage(htmlContent) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg bot';
        msgDiv.innerHTML = formatMarkdown(htmlContent);
        chatbotMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    // Show Typing Indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-msg bot typing';
        typingDiv.id = 'chatTypingIndicator';
        typingDiv.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;
        chatbotMessages.appendChild(typingDiv);
        scrollToBottom();
    }

    // Remove Typing Indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('chatTypingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Scroll Message Box to Bottom
    function scrollToBottom() {
        if (chatbotMessages) {
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    }

    // Quick Replies Click Handler
    window.handleQuickReply = (text) => {
        // Strip emoji before sending to query parser if desired, or send as is
        appendUserMessage(text);
        handleBotResponse(text);
    };

    // Helper to format basic Markdown to HTML (bold and links)
    function formatMarkdown(text) {
        if (!text) return "";
        // Convert **bold** to <strong>bold</strong>
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Convert [text](url) to styled anchor links
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:#f093fb; text-decoration:underline;">$1</a>');
        // Convert newlines to html line breaks (if not already handled)
        if (!formatted.includes('<br>')) {
            formatted = formatted.replace(/\n/g, '<br>');
        }
        return formatted;
    }

    // Bot Response Handler (Queries serverless Gemini endpoint with fallback)
    async function handleBotResponse(userText) {
        showTypingIndicator();

        // Build simple context array from last 6 visible messages (ignoring typing indicator)
        const chatHistory = [];
        const msgElements = chatbotMessages.querySelectorAll('.chat-msg:not(.typing)');
        const maxContext = 6;
        const startIndex = Math.max(0, msgElements.length - maxContext);
        
        for (let i = startIndex; i < msgElements.length; i++) {
            const el = msgElements[i];
            const isUser = el.classList.contains('user');
            chatHistory.push({
                role: isUser ? 'user' : 'model',
                text: el.innerText
            });
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userText,
                    history: chatHistory.slice(0, -1) // Exclude the current user message we just appended
                })
            });

            if (!response.ok) {
                throw new Error('Serverless function failed or API key not set');
            }

            const data = await response.json();
            if (data.reply) {
                removeTypingIndicator();
                appendBotMessage(data.reply);
                return;
            }
        } catch (error) {
            console.warn('API connection failed, falling back to local engine:', error.message);
        }

        // Graceful Local Fallback Engine if Backend API is offline
        setTimeout(() => {
            removeTypingIndicator();
            handleLocalFallback(userText);
        }, 1000);
    }

    // Local Matching Fallback Engine
    function handleLocalFallback(userText) {
        const text = userText.toLowerCase();
        let reply = "";

        if (text.includes('project') || text.includes('portfolio') || text.includes('work')) {
            reply = "Usman has built advanced AI/ML systems. Two key projects are:<br><br>🤖 **AI Decision-Making Agent**: AWS-deployed RAG workflow built with LangChain.<br><br>🎭 **Realistic AI Avatar Creator**: Custom video generation pipeline built with Wan 2.0 models.<br><br>Which would you like to explore?";
        } else if (text.includes('avatar') || text.includes('wan') || text.includes('video') || text.includes('digital human')) {
            reply = "The **Realistic AI Avatar Creator** runs a custom **Wan 2.0** inference pipeline to generate highly realistic digital human expressions and lip-sync. Usman optimized it for photorealistic output and fast processing speeds.";
        } else if (text.includes('agent') || text.includes('langchain') || text.includes('langgraph') || text.includes('decision')) {
            reply = "The **AI Decision-Making Agent** leverages GPT-4, LangChain, and vector databases for Retrieval-Augmented Generation (RAG). Deployed on AWS with a Streamlit interface, it automates complex reasoning workflows.";
        } else if (text.includes('skills') || text.includes('python') || text.includes('tech') || text.includes('experience')) {
            reply = "Usman's core technical skills include:<br>• **AI/Agents**: LangChain, LangGraph, RAG<br>• **Libraries**: PyTorch, OpenCV, Transformers<br>• **Full Stack**: Django, FastAPI, PostgreSQL, Docker<br>• **Specialties**: Video AI (Wan 2.0), NLP, AWS deployment";
        } else if (text.includes('contact') || text.includes('hire') || text.includes('call') || text.includes('email') || text.includes('calendly')) {
            reply = "You can easily connect with Usman:<br>• 📧 [m.usmandev99@gmail.com](mailto:m.usmandev99@gmail.com)<br>• 📱 +92 316 4217957<br>• 📅 Book directly on [Calendly](https://calendly.com/m-usmandev99/30min)";
        } else if (text.includes('adobe') || text.includes('stock') || text.includes('art') || text.includes('prompt')) {
            reply = "Usman has a successful digital assets portfolio on **Adobe Stock**, utilizing advanced prompt engineering to design high-demand, commercial AI graphics. You can view his featured works in the 'AI Art' section of this page, or visit his [Adobe Stock Contributor Page](https://stock.adobe.com/contributor/212103995/Muhammad).";
        } else if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('yo')) {
            reply = "Hello! 👋 How can I help you today? Feel free to ask about Usman's **projects**, **skills**, **Adobe Stock** art, or **how to book a call**.";
        } else {
            reply = "Interesting question! Usman specializes in AI agents, video pipelines, RAG, and Django. Would you like to know more about his **Projects**, **Skills**, **Adobe Stock**, or **Contact** details?";
        }

        appendBotMessage(reply);
    }

    // Custom Video Controls Handlers
    window.toggleMute = (event, btn) => {
        event.stopPropagation();
        const video = btn.closest('.project-video').querySelector('.project-video-element');
        if (video) {
            video.muted = !video.muted;
            if (video.muted) {
                btn.innerHTML = '🔊 Unmute';
                btn.classList.remove('unmuted');
            } else {
                btn.innerHTML = '🔇 Mute';
                btn.classList.add('unmuted');
            }
        }
    };

    window.toggleFullscreen = (event, btn) => {
        event.stopPropagation();
        const video = btn.closest('.project-video').querySelector('.project-video-element');
        if (video) {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) { /* Safari */
                video.webkitRequestFullscreen();
            } else if (video.mozRequestFullScreen) { /* Firefox */
                video.mozRequestFullScreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        }
    };
});

