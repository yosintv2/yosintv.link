function showPopup() {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

setTimeout(showPopup, 5000); // Show popup after 5 seconds

// Apply initial theme immediately
(function initializeTheme() {
    const mode = localStorage.getItem('mode') || 'light';
    document.body.classList.add(`theme-${mode}`);
})();

document.addEventListener('DOMContentLoaded', function() {
    let shortenedUrl = '';
    let displayUrl = '';

    // Utility function for base36 encoding
    function base36Encode(str) {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            result += chars[charCode % 36];
        }
        return result;
    }

    // Utility function for showing toast notifications
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '10px 20px';
        toast.style.backgroundColor = '#333';
        toast.style.color = '#fff';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Utility function to clean and validate TinyURL ID
    function cleanTinyUrlId(url) {
        try {
            const decodedUrl = decodeURIComponent(url);
            const match = decodedUrl.match(/tinyurl\.com\/([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        } catch (error) {
            console.error("Error cleaning TinyURL ID:", error);
            return null;
        }
    }

    function loadShareLink() {
        try {
            const originalUrl = window.location.href;
            const url = new URL(originalUrl);
            const srcParam = url.searchParams.get('src');
            let displayUrlBase = originalUrl;

            if (srcParam) {
                const decodedSrc = decodeURIComponent(srcParam);
                displayUrlBase = originalUrl.replace(srcParam, decodedSrc);
            }
            displayUrl = decodeURIComponent(displayUrlBase);

            const apiUrl = 'https://tinyurl.com/api-create.php?url=' + encodeURIComponent(originalUrl);

            fetch(apiUrl)
                .then(response => response.text())
                .then(shortUrl => {
                    if (!shortUrl.startsWith('http')) throw new Error('Invalid TinyURL');
                    shortenedUrl = shortUrl;
                    const tinyId = cleanTinyUrlId(shortUrl);
                    if (!tinyId) throw new Error('Could not extract valid TinyURL ID');
                    const encoded = base36Encode(tinyId);
                    displayUrl = `https://www.getemoji.online/url.html?u=${encoded}`;
                    const shareLinkBox = document.getElementById("shareLinkBox");
                    if (shareLinkBox) shareLinkBox.textContent = displayUrl;
                })
                .catch(error => {
                    shortenedUrl = originalUrl;
                    const shareLinkBox = document.getElementById("shareLinkBox");
                    if (shareLinkBox) shareLinkBox.textContent = displayUrl;
                    console.error("Shortening failed:", error);
                    showToast("Failed to generate share URL");
                });
        } catch (error) {
            console.error("loadShareLink error:", error);
            showToast("Error loading share link");
        }
    }

    function copyToClipboard() {
        try {
            const shareLinkBox = document.getElementById("shareLinkBox");
            if (!shareLinkBox) throw new Error("shareLinkBox not found");
            const text = shareLinkBox.textContent;
            navigator.clipboard.writeText(text).then(() => {
                showToast("Link copied to clipboard!");
            }).catch(error => {
                console.error("Copy failed:", error);
                showToast("Failed to copy link. Please select and copy manually.");
            });
        } catch (error) {
            console.error("copyToClipboard error:", error);
        }
    }

    function copyPosterShortUrl(url) {
        try {
            showToast('Generating share URL...');
            fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
                .then(res => res.text())
                .then(tinyUrl => {
                    if (!tinyUrl.startsWith('http')) throw new Error('Invalid TinyURL');
                    const tinyId = cleanTinyUrlId(tinyUrl);
                    if (!tinyId) throw new Error('Could not extract valid TinyURL ID');
                    const encoded = base36Encode(tinyId);
                    const shortUrl = `https://www.getemoji.online/url.html?u=${encoded}`;
                    navigator.clipboard.writeText(shortUrl);
                    showToast('Share URL copied!');
                    const shareLinkBox = document.getElementById("shareLinkBox");
                    if (shareLinkBox) shareLinkBox.textContent = shortUrl;
                })
                .catch(error => {
                    console.error("copyPosterShortUrl error:", error);
                    showToast('Error generating share URL');
                });
        } catch (error) {
            console.error("copyPosterShortUrl error:", error);
            showToast('Error generating share URL');
        }
    }

    function shareTo(platform) {
        try {
            const text = encodeURIComponent("Check out this live stream on YoSinTV!");
            const url = encodeURIComponent(displayUrl || window.location.href);
            let shareUrl;

            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
                    break;
                case 'instagram':
                    navigator.clipboard.writeText(displayUrl).then(() => {
                        showToast("Instagram doesn't support direct web sharing. Link copied to clipboard! Open Instagram, create a story or post, and paste the link.");
                    }).catch(error => {
                        console.error("Copy failed:", error);
                        showToast("Failed to copy link for Instagram. Please select and copy manually.");
                    });
                    return;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                    break;
                case 'messenger':
                    shareUrl = `https://www.facebook.com/dialog/send?link=${url}&app_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}`;
                    break;
                default:
                    return;
            }

            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error("shareTo error:", error);
        }
    }

    function rdmode() {
        try {
            console.log("rdmode called");
            const currentMode = localStorage.getItem("mode") || 'light';
            const newMode = currentMode === "dark" ? "light" : "dark";
            localStorage.setItem("mode", newMode);
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(`theme-${newMode}`);
            const modeToggle = document.querySelector('.mode-toggle i');
            if (modeToggle) {
                modeToggle.classList.toggle('fa-moon', newMode === 'dark');
                modeToggle.classList.toggle('fa-sun', newMode === 'light');
            }
        } catch (error) {
            console.error("rdmode error:", error);
        }
    }

    function toggleFullscreen() {
        try {
            console.log("toggleFullscreen called");
            const playerWrapper = document.querySelector('.player-wrapper');
            const fullscreenButton = document.querySelector('.fullscreen-toggle i');
            const iframe = document.getElementById('iframe');
            const jwPlayer = document.getElementById('jwPlayer');

            if (!playerWrapper || !fullscreenButton || !iframe || !jwPlayer) {
                throw new Error("Required elements not found");
            }

            const requestFullscreen = element => {
                if (element.requestFullscreen) return element.requestFullscreen();
                if (element.mozRequestFullScreen) return element.mozRequestFullScreen();
                if (element.webkitRequestFullscreen) return element.webkitRequestFullscreen();
                if (element.msRequestFullscreen) return element.msRequestFullscreen();
                return Promise.reject(new Error("Fullscreen API not supported"));
            };

            const exitFullscreen = () => {
                if (document.exitFullscreen) return document.exitFullscreen();
                if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
                if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
                if (document.msExitFullscreen) return document.msExitFullscreen();
                return Promise.reject(new Error("Exit fullscreen not supported"));
            };

            if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                if (iframe.style.display !== 'none') {
                    requestFullscreen(iframe).catch(err => {
                        console.error("Iframe fullscreen error:", err);
                        requestFullscreen(playerWrapper).catch(err => {
                            console.error("Player wrapper fullscreen error:", err);
                            alert("Fullscreen mode not supported by your browser or stream source.");
                        });
                    });
                } else {
                    requestFullscreen(playerWrapper).catch(err => {
                        console.error("Player wrapper fullscreen error:", err);
                        alert("Fullscreen mode not supported by your browser.");
                    });
                }
                fullscreenButton.classList.remove('fa-expand');
                fullscreenButton.classList.add('fa-compress');
            } else {
                exitFullscreen().catch(err => {
                    console.error("Exit fullscreen error:", err);
                });
                fullscreenButton.classList.remove('fa-compress');
                fullscreenButton.classList.add('fa-expand');
            }
        } catch (error) {
            console.error("toggleFullscreen error:", error);
        }
    }

    function toggleChat() {
        try {
            console.log("toggleChat called");
            const chatSection = document.querySelector('.chat-section');
            const chatIframe = chatSection.querySelector('iframe');
            const chatButton = document.querySelector('.chat-toggle');
            const chatIcon = chatButton.querySelector('i');

            if (!chatSection || !chatIframe || !chatButton || !chatIcon) {
                throw new Error("Chat elements not found");
            }

            const isVisible = chatSection.style.display !== 'none';
            if (isVisible) {
                chatSection.style.display = 'none';
                chatIframe.src = ''; // Clear src to stop loading
                chatButton.innerHTML = '<i class="fas fa-comment"></i> Add Comment';
            } else {
                chatSection.style.display = 'block';
                chatIframe.src = 'https://www.yosintv.link/chat'; // Load chat
                chatButton.innerHTML = '<i class="fas fa-comment-slash"></i> Hide Comment';
            }
        } catch (error) {
            console.error("toggleChat error:", error);
        }
    }

    function initializePlayer() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const srcParam = urlParams.get('src');
            const videoUrl = urlParams.get('hls');

            const iframe = document.getElementById('iframe');
            const jwPlayerDiv = document.getElementById('jwPlayer');

            if (!iframe || !jwPlayerDiv) throw new Error("Player elements not found");

            if (srcParam) {
                iframe.src = srcParam;
                jwPlayerDiv.style.display = 'none';
            } else if (videoUrl && typeof jwplayer === 'function') {
                jwplayer("jwPlayer").setup({
                    file: videoUrl,
                    width: "100%",
                    aspectratio: "16:9"
                });
                iframe.style.display = 'none';
            }
        } catch (error) {
            console.error("initializePlayer error:", error);
        }
    }

    // Initialize the app
    initializePlayer();
    loadShareLink();

    // Expose functions globally for inline event handlers
    window.rdmode = rdmode;
    window.toggleFullscreen = toggleFullscreen;
    window.toggleChat = toggleChat;
    window.copyToClipboard = copyToClipboard;
    window.shareTo = shareTo;
    window.copyPosterShortUrl = copyPosterShortUrl;
});

// Domain restriction check
(function() {
    const allowedDomains = ['ww.yosintvlive.com', 'tv.getemoji.online', 'dplayerr.blogspot.com'];
    const currentDomain = window.location.hostname.toLowerCase().split(':')[0]; // Normalize domain, remove port

    if (!allowedDomains.includes(currentDomain)) {
        window.location.replace('https://www.yosin-tv.net/');
    } else {
        console.log('Domain allowed:', currentDomain);
    }
})();
