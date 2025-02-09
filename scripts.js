// Function to render a single post
function renderPost(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Add image with timestamp and tags as alt text
    if (post.image_src) {
        const img = document.createElement('img');
        img.setAttribute('data-src', post.image_src);
        img.classList.add('lazy');
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Tiny transparent placeholder
        
        // Build alt text from timestamp and tags
        let altText = [];
        if (post.timestamp) {
            altText.push(`Posted on: ${post.timestamp}`);
        }
        if (post.tag && post.tag.length > 0) {
            altText.push(`Tags: ${post.tag.join(', ')}`);
        }
        img.alt = altText.join(' | ');
        
        postElement.appendChild(img);
    }

    // Add caption
    if (post.caption) {
        const caption = document.createElement('div');
        caption.classList.add('caption');
        caption.innerHTML = post.caption; // Use innerHTML to render HTML content
        postElement.appendChild(caption);
    }

    return postElement;
}

// Function to load and render all posts
async function loadPosts() {
    try {
        // Fetch the JSON file
        const response = await fetch('posts.json');
        if (!response.ok) {
            throw new Error('Failed to load posts');
        }

        // Parse the JSON data
        const posts = await response.json();

        // Group posts by date
        const groupedPosts = {};
        posts.forEach(post => {
            const date = new Date(post.timestamp);
            const dateKey = date.toISOString().split('T')[0];
            if (!groupedPosts[dateKey]) {
                groupedPosts[dateKey] = [];
            }
            groupedPosts[dateKey].push(post);
        });

        // Get the container for posts
        const postsContainer = document.getElementById('posts-container');

        // Sort dates in ascending order
        const sortedDates = Object.keys(groupedPosts).sort();

        // Render posts grouped by date
        sortedDates.forEach(dateKey => {
            // Create date header
            const date = new Date(dateKey);
            const dateHeader = document.createElement('div');
            dateHeader.classList.add('date-header');
            dateHeader.id = `date-${dateKey}`;
            dateHeader.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
            }).toUpperCase();
            postsContainer.appendChild(dateHeader);

            // Render posts for this date
            groupedPosts[dateKey].forEach(post => {
                const postElement = renderPost(post);
                postsContainer.appendChild(postElement);
            });
        });
        
        // Observe all images after they're added to the DOM
        observeImages();
        // Observe date headers
        observeDateHeaders();
    } catch (error) {
        console.error('Error loading posts:', error);
        const postsContainer = document.getElementById('posts-container');
        postsContainer.textContent = 'Failed to load posts. Please try again later.';
    }
}

// Load posts when the page loads
window.onload = async () => {
    await loadPosts();
    
    // Check if there's a date in the URL and scroll to it
    const hash = window.location.hash;
    if (hash && hash.startsWith('#date-')) {
        const element = document.querySelector(hash);
        if (element) {
            element.scrollIntoView();
        }
    }
};

// Set up lazy loading
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px 0px', // Start loading 50px before they enter viewport
    threshold: 0.1
});

// Observe all lazy images after posts are rendered
function observeImages() {
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add mutation observer to watch for new images
const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.tagName === 'IMG' && node.classList.contains('lazy')) {
                imageObserver.observe(node);
            }
        });
    });
});

mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Set up date header observer
const dateHeaderObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const dateId = entry.target.id;
            // Update URL without scrolling
            history.replaceState(null, null, `#${dateId}`);
        }
    });
}, {
    rootMargin: '-50% 0px', // Trigger when header is in middle of viewport
    threshold: 0
});

// Function to observe date headers
function observeDateHeaders() {
    document.querySelectorAll('.date-header').forEach(header => {
        dateHeaderObserver.observe(header);
    });
}

// Add date header observation after posts are loaded
document.addEventListener('DOMContentLoaded', observeDateHeaders);
