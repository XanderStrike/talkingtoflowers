// Function to render a single post
function renderPost(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Add image
    if (post.image_src) {
        const img = document.createElement('img');
        img.src = post.image_src;
        postElement.appendChild(img);
    }

    // Add timestamp
    if (post.timestamp) {
        const timestamp = document.createElement('div');
        timestamp.classList.add('timestamp');
        timestamp.textContent = `Posted on: ${post.timestamp}`;
        postElement.appendChild(timestamp);
    }

    // Add tags
    if (post.tag && post.tag.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.classList.add('tags');
        post.tag.forEach(tagText => {
            const tag = document.createElement('span');
            tag.textContent = tagText;
            tagsContainer.appendChild(tag);
        });
        postElement.appendChild(tagsContainer);
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

        // Sort dates in descending order
        const sortedDates = Object.keys(groupedPosts).sort().reverse();

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
