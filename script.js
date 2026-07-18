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

    // 5. Play Video on Click (Autoplay integration)
    window.playVideo = (element) => {
        element.classList.add('playing');
        
        // Find iframe inside and try to append autoplay query parameter if it exists
        const iframe = element.querySelector('iframe');
        if (iframe) {
            let src = iframe.getAttribute('src');
            if (src && !src.includes('autoplay=1')) {
                src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
                iframe.setAttribute('src', src);
            }
        }
    };

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
            appendBotMessage("Hi there! 👋 I'm Usman's virtual assistant. Ask me anything about his AI/ML projects, skills, or how we can work together!");
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
        msgDiv.innerHTML = htmlContent;
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
        appendUserMessage(text);
        handleBotResponse(text);
    };

    // Bot Response Logic (Keyword Matching engine)
    function handleBotResponse(userText) {
        showTypingIndicator();
        const text = userText.toLowerCase();

        let reply = "";

        if (text.includes('project') || text.includes('portfolio') || text.includes('work')) {
            reply = "Usman has built advanced AI/ML systems. Two key projects are:<br><br>🤖 <strong>AI Decision-Making Agent</strong>: AWS-deployed RAG workflow built with LangChain.<br><br>🎭 <strong>Realistic AI Avatar Creator</strong>: Lip-sync pipeline using Wav2Lip models.<br><br>Which would you like to explore?";
        } else if (text.includes('avatar') || text.includes('wav2lip') || text.includes('lip')) {
            reply = "The <strong>Realistic AI Avatar Creator</strong> uses Wav2Lip 2.2 to synchronize speaking audio with video avatars. Usman optimized the lip sync and expression pipelines for multilingual output in commercial video editing.";
        } else if (text.includes('agent') || text.includes('langchain') || text.includes('langgraph') || text.includes('decision')) {
            reply = "The <strong>AI Decision-Making Agent</strong> leverages GPT-4, LangChain, and vector databases for Retrieval-Augmented Generation (RAG). Deployed on AWS with a Streamlit interface, it automates complex reasoning workflows.";
        } else if (text.includes('skills') || text.includes('python') || text.includes('tech') || text.includes('experience')) {
            reply = "Usman's core technical skills include:<br>• <strong>AI/Agents</strong>: LangChain, LangGraph, RAG<br>• <strong>Libraries</strong>: PyTorch, OpenCV, Transformers<br>• <strong>Full Stack</strong>: Django, FastAPI, PostgreSQL, Docker<br>• <strong>Specialties</strong>: Video AI, NLP, AWS deployment";
        } else if (text.includes('contact') || text.includes('hire') || text.includes('call') || text.includes('email') || text.includes('calendly')) {
            reply = "You can easily connect with Usman:<br>• 📧 <a href='mailto:m.usmandev99@gmail.com' style='color:#f093fb;'>m.usmandev99@gmail.com</a><br>• 📱 +92 316 4217957<br>• 📅 Book directly on <a href='https://calendly.com/m-usmandev99/30min' target='_blank' style='color:#f093fb; text-decoration:underline;'>Calendly</a>";
        } else if (text.includes('adobe') || text.includes('stock') || text.includes('art') || text.includes('prompt')) {
            reply = "Usman has a successful digital assets portfolio on **Adobe Stock**, utilizing advanced prompt engineering to design high-demand, commercial AI graphics. You can view his featured works in the 'AI Art' section of this page, or visit his <a href='https://stock.adobe.com/contributor/212103995/Muhammad' target='_blank' style='color:#f093fb; text-decoration:underline;'>Adobe Stock Contributor Page</a>.";
        } else if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('yo')) {
            reply = "Hello! 👋 How can I help you today? Feel free to ask about Usman's **projects**, **skills**, **Adobe Stock** art, or **how to book a call**.";
        } else {
            reply = "Interesting question! Usman specializes in AI agents, video pipelines, RAG, and Django. Would you like to know more about his **Projects**, **Skills**, **Adobe Stock**, or **Contact** details?";
        }

        // Simulate typing delay
        setTimeout(() => {
            removeTypingIndicator();
            appendBotMessage(reply);
        }, 1200);
    }
});

