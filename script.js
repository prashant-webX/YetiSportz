// script.js (Includes stream page logic + new homepage logic)

// Assume db is initialized and exported from firebase-config.js
const db = firebase.database(); 
const matchesRef = db.ref('matches');
const postsRef = db.ref('posts');
const highlightsRef = db.ref('highlights');

// --- 1. Homepage Logic: Run only on index.html ---
if (document.getElementById('match-cards-container')) {
    
    // --- A. Render Highlights (Stories) ---
    highlightsRef.on('value', snapshot => {
        const highlightsContainer = document.getElementById('highlight-stories');
        highlightsContainer.innerHTML = ''; // Clear loading message

        const highlights = snapshot.val();
        if (!highlights) {
            highlightsContainer.innerHTML = '<p>No highlights available.</p>';
            return;
        }

        // Iterate through highlights (e.g., keys could be categories or match IDs)
        Object.keys(highlights).forEach(key => {
            const data = highlights[key];
            const card = document.createElement('a');
            card.href = `stream.html?id=${data.matchId || key}`; // Use matchId or key
            card.className = 'highlight-card';
            card.style.backgroundImage = `url('${data.imageUrl}')`;
            card.innerHTML = `<p>${data.title}</p>`;
            
            highlightsContainer.appendChild(card);
        });
    });

    // --- B. Render Match Cards (Dynamic Status) ---
    matchesRef.on('value', snapshot => {
        const matchesContainer = document.getElementById('match-cards-container');
        matchesContainer.innerHTML = ''; // Clear loading message

        const matches = snapshot.val();
        if (!matches) {
            matchesContainer.innerHTML = '<p>No matches scheduled yet.</p>';
            return;
        }

        Object.keys(matches).reverse().forEach(matchId => { // Show newest first
            const match = matches[matchId];
            const timeStart = new Date(match.time_start);
            const now = new Date();
            const timeEnd = new Date(timeStart.getTime() + (match.duration_mins + match.halftime_mins) * 60000); // 90+15 min

            let statusText = 'SCHEDULED';
            let statusClass = 'scheduled';
            let scoreContent = match.score || '0 - 0'; // Default score

            if (now >= timeStart && now <= timeEnd) {
                statusText = 'LIVE NOW 🔴';
                statusClass = 'live';
            } else if (now > timeEnd) {
                statusText = 'ENDED';
                statusClass = 'ended';
            } else {
                // Display start time if scheduled
                statusText = `Starts ${timeStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }

            // Create the Match Card element
            const card = document.createElement('a');
            card.href = `stream.html?id=${matchId}`;
            card.className = 'match-card ' + statusClass;
            
            // Score Embed logic: Show Scorebat iframe if URL is provided and match is not ended
            let scoreEmbedHTML = '';
            if (match.score_embed_url && statusClass !== 'ended') {
                 scoreEmbedHTML = `<iframe src="${match.score_embed_url}" 
                                            width="100%" height="80px" 
                                            frameborder="0" 
                                            allowfullscreen></iframe>`;
            } else {
                 scoreEmbedHTML = `<span>Score: ${scoreContent}</span>`;
            }


            card.innerHTML = `
                <div class="match-header">
                    <h3>${match.title}</h3>
                    <span class="match-status ${statusClass}">${statusText}</span>
                </div>
                <div class="score-display">
                   ${scoreEmbedHTML}
                </div>
            `;
            matchesContainer.appendChild(card);
        });
    });
    
    // --- C. Render News/Posts ---
    postsRef.on('value', snapshot => {
        const postsContainer = document.getElementById('news-posts-container');
        postsContainer.innerHTML = ''; // Clear loading message

        const posts = snapshot.val();
        if (!posts) {
            postsContainer.innerHTML = '<p>No news updates yet.</p>';
            return;
        }

        Object.keys(posts).reverse().forEach(postId => {
            const post = posts[postId];
            const postElement = document.createElement('div');
            postElement.className = 'news-post';
            
            let mediaHtml = '';
            if (post.mediaUrl) {
                if (post.mediaType === 'image') {
                    mediaHtml = `<img src="${post.mediaUrl}" alt="Post Image">`;
                } else if (post.mediaType === 'video') {
                    // Embed video or use <video> tag
                    mediaHtml = `<video src="${post.mediaUrl}" controls></video>`;
                }
            }

            postElement.innerHTML = `
                <h4>${post.title}</h4>
                <p>${post.content}</p>
                ${mediaHtml}
            `;
            postsContainer.appendChild(postElement);
        });
    });
}


// --- 2. Stream Page Logic: (The original logic from my previous answer goes here) ---
// (The functions getMatchIdFromUrl(), loadStream(), and all event listeners 
// for the stream page belong below this point in script.js)
// ...
// (e.g., If document.getElementById('video-wrapper') { ... load stream logic ... } )