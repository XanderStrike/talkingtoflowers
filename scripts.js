// Function to render a single post
function renderPost(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Add image with timestamp and tags as alt text
    if (post.image_src) {
        const img = document.createElement('img');
        img.src = post.image_src;
        
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
    } catch (error) {
        console.error('Error loading posts:', error);
        const postsContainer = document.getElementById('posts-container');
        postsContainer.textContent = 'Failed to load posts. Please try again later.';
    }
}

// Load posts when the page loads
window.onload = loadPosts;
