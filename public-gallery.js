document.addEventListener('DOMContentLoaded', () => {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('Supabase client not initialized.');
        return;
    }

    const galleryContainer = document.getElementById('public-gallery-container');

    /**
     * Fetches and displays public gallery posts.
     */
    const loadPublicGallery = async () => {
        if (!galleryContainer) return;

        galleryContainer.innerHTML = '<p>Loading gallery...</p>';

        try {
            const { data, error } = await supabase
                .from('gallery_posts')
                .select('title, description, image_url')
                .order('created_at', { ascending: false });

            if (error) throw error;

            galleryContainer.innerHTML = ''; // Clear loading message

            if (data.length === 0) {
                galleryContainer.innerHTML = '<p>No gallery posts have been added yet. Check back soon!</p>';
                return;
            }

            data.forEach(post => {
                const postCard = document.createElement('div');
                postCard.className = 'gallery-card';
                postCard.style.cssText = 'border: 1px solid #eee; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);';
                postCard.innerHTML = `
                    <img src="${post.image_url}" alt="${post.title}" style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="padding: 15px;">
                        <h3 style="margin: 0 0 10px; color: #333;">${post.title}</h3>
                        <p style="margin: 0; color: #666; font-size: 0.9em;">${post.description || ''}</p>
                    </div>
                `;
                galleryContainer.appendChild(postCard);
            });
        } catch (error) {
            console.error('Error loading public gallery:', error.message);
            galleryContainer.innerHTML = '<p style="color: red;">Could not load the gallery at this time.</p>';
        }
    };

    loadPublicGallery();
});