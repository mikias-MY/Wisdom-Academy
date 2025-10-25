document.addEventListener('DOMContentLoaded', () => {
    // Use the globally initialized Supabase client
    const supabase = window.supabaseClient;
    if (!supabase) { console.error('Supabase client not initialized globally.'); return; }
    const loginForm = document.querySelector('.login-form');
    const adminDashboardContent = document.getElementById('admin-dashboard-content');
    const logoutLink = document.getElementById('logout-link');

    /**
     * Handles the login form submission.
     */
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert(`Login failed: ${error.message}`);
            } else if (data.user) {
                // On successful login, redirect to the admin page.
                window.location.href = 'admin.html';
            }
        });
    }

    /**
     * Handles the logout functionality.
     */
    if (logoutLink) {
        logoutLink.addEventListener('click', async (event) => {
            event.preventDefault();
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error logging out:', error.message);
            } else {
                // On successful logout, redirect to the login page.
                window.location.href = 'login.html';
            }
        });
    }

    /**
     * Protects a page by checking for an active session.
     * Redirects to login page if no user is authenticated.
     * This should be used on pages that require authentication (e.g., admin.html).
     */
    const protectPage = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            // No active session, redirect to login.
            window.location.href = 'login.html';
            return; // Stop execution if not logged in
        }

        // The user object is nested inside the session object
        const user = session.user;

        // If on admin.html and logged in, show the dashboard content
        if (adminDashboardContent) {
            adminDashboardContent.style.display = 'block';
            handleAdminFeatures(user); // Pass the correct user object
        }
    };

    /**
     * Handles displaying and managing admin-specific features.
     * @param {object} user - The currently logged-in user object.
     */
     const handleAdminFeatures = async (user) => {
         // --- Element Selectors ---
         const schoolStatsForm = document.getElementById('school-stats-form');
         const galleryPostForm = document.getElementById('gallery-post-form');
         const applicationsContainer = document.getElementById('applications-container');
         const messagesContainer = document.getElementById('messages-container');
 
         // --- Feature Initialization ---
         if (schoolStatsForm) {
             document.getElementById('stats-management-section').style.display = 'block';
             setupStatsManagement(schoolStatsForm);
         }
         if (galleryPostForm) {
             document.getElementById('gallery-management-section').style.display = 'block';
             setupGalleryManagement(user);
         }
         if (applicationsContainer) {
             document.getElementById('applications-management-section').style.display = 'block';
             setupApplicationsManagement();
         }
         if (messagesContainer) {
             document.getElementById('messages-management-section').style.display = 'block';
             setupMessagesManagement();
         }
     };
 
     /**
      * Sets up the school statistics management form.
      * @param {HTMLFormElement} form - The stats form element.
      */
     const setupStatsManagement = async (form) => {
         const studentsInput = document.getElementById('students_enrolled');
         const teachersInput = document.getElementById('qualified_teachers');
         const gradeTextInput = document.getElementById('grade_level_text');
         const messageEl = document.getElementById('stats-message');
 
         // Fetch and populate current stats
         try {
             const { data, error } = await supabase.from('school_stats').select('*').eq('id', 1).single();
             if (error) throw error;
             if (data) {
                 studentsInput.value = data.students_enrolled;
                 teachersInput.value = data.qualified_teachers;
                 gradeTextInput.value = data.grade_level_text;
             }
         } catch (error) {
             console.error('Error fetching school stats:', error.message);
             messageEl.textContent = 'Error loading stats.';
             messageEl.style.color = 'red';
         }
 
         // Handle form submission
         form.addEventListener('submit', async (event) => {
             event.preventDefault();
             messageEl.textContent = 'Saving...';
             messageEl.style.color = 'orange';
 
             const { error } = await supabase.from('school_stats').update({
                 students_enrolled: studentsInput.value,
                 qualified_teachers: teachersInput.value,
                 grade_level_text: gradeTextInput.value,
             }).eq('id', 1);
 
             if (error) {
                 messageEl.textContent = `Error: ${error.message}`;
                 messageEl.style.color = 'red';
             } else {
                 messageEl.textContent = 'Changes saved successfully!';
                 messageEl.style.color = 'green';
             }
         });
     };
 
     /**
      * Sets up all gallery management functionality: loading, creating, editing, and deleting.
      * @param {object} user - The authenticated user object.
      */
     const setupGalleryManagement = (user) => {
         const form = document.getElementById('gallery-post-form');
         const formTitle = document.getElementById('gallery-form-title');
         const postIdInput = document.getElementById('post-id');
         const titleInput = document.getElementById('post-title');
         const descriptionInput = document.getElementById('post-description');
         const imageInput = document.getElementById('post-image');
         const imagePreview = document.getElementById('image-preview');
         const messageEl = document.getElementById('gallery-message');
         const postsContainer = document.getElementById('gallery-posts-container');
         const cancelEditBtn = document.getElementById('cancel-edit-btn');

         // --- Image Preview ---
         imageInput.addEventListener('change', () => {
             const file = imageInput.files[0];
             if (file) {
                 const reader = new FileReader();
                 reader.onload = (e) => {
                     imagePreview.src = e.target.result;
                     imagePreview.style.display = 'block';
                 };
                 reader.readAsDataURL(file);
             }
         });

         // --- Reset Form / Cancel Edit ---
         const resetForm = () => {
             form.reset();
             postIdInput.value = '';
             formTitle.textContent = 'Create New Post';
             imagePreview.style.display = 'none';
             imageInput.required = true; // Image is required for new posts
             cancelEditBtn.style.display = 'none';
             messageEl.textContent = '';
         };

         cancelEditBtn.addEventListener('click', resetForm);

         // --- Load Existing Posts ---
         const loadPosts = async () => {
             postsContainer.innerHTML = '<p>Loading posts...</p>';
             const { data, error } = await supabase.from('gallery_posts').select('*').order('created_at', { ascending: false });

             if (error) {
                 postsContainer.innerHTML = '<p style="color: red;">Error loading posts.</p>';
                 return;
             }

             if (data.length === 0) {
                 postsContainer.innerHTML = '<p>No posts yet. Create one using the form above.</p>';
                 return;
             }

             postsContainer.innerHTML = '';
             data.forEach(post => {
                 const card = document.createElement('div'); // Corrected from `const card` to `const card`
                 card.className = 'gallery-post-card';
                 card.innerHTML = `
                     <img src="${post.image_url}" alt="${post.title}">
                     <h4>${post.title}</h4>
                     <div class="action-buttons">
                         <button class="edit-btn btn-secondary" data-id="${post.id}">Edit</button>
                         <button class="delete-btn btn-danger" data-id="${post.id}" data-image-url="${post.image_url}">Delete</button>
                     </div>
                 `;
                 postsContainer.appendChild(card);
             });
         };

         /**
          * Uploads an image file to Supabase Storage and returns its public URL.
          * @param {File} file - The image file to upload.
          * @param {string} userId - The ID of the user uploading the file.
          * @returns {Promise<string>} The public URL of the uploaded image.
          */
         const uploadImage = async (file, userId) => {
             // 1. Validate the inputs
             if (!file || file.size === 0) {
                 throw new Error('The selected file is empty or invalid. Please choose a valid image.');
             }
             if (!userId) {
                throw new Error('User ID is missing. Please log in again.');
             }
 
             // 2. Sanitize the filename and create a unique path
             const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, ''); // Keep this for sanitization
             const filePath = `gallery/${userId}/${Date.now()}-${cleanFileName}`; // Re-add 'gallery/' prefix
 
             // 3. Upload the file to the 'gallery-images' bucket
             const { error: uploadError } = await supabase.storage
                 .from('gallery-images')
                 .upload(filePath, file, { upsert: true }); // Allows replacing duplicates
 
             if (uploadError) throw uploadError;
 
             // 4. Get and return the public URL
             const { data } = supabase.storage.from('gallery-images').getPublicUrl(filePath);
             return data.publicUrl;
         };

         // --- Handle Form Submission (Create/Update) ---
         form.addEventListener('submit', async (e) => {
             e.preventDefault();
             const postId = postIdInput.value;
             const isEditing = !!postId;

             const title = titleInput.value;
             const description = descriptionInput.value;
             const imageFile = imageInput.files[0];

             if (!isEditing && !imageFile) {
                 messageEl.textContent = 'An image is required for a new post.';
                 messageEl.style.color = 'red';
                 return;
             }

             messageEl.textContent = 'Saving...';
             messageEl.style.color = 'orange';

             try {
                 let imageUrl;
                 // 1. If there's a new image, upload it
                 if (imageFile) {
                    imageUrl = await uploadImage(imageFile, user.id);
                 }

                 // 2. Prepare data for the database
                 const postData = {
                     title,
                     description,
                     user_id: user.id // Explicitly set the user ID for the new row
                 };
                 if (imageUrl) postData.image_url = imageUrl;

                 // 3. Upsert (Update or Insert) the data
                 let query;
                 if (isEditing) {
                     query = supabase.from('gallery_posts').update(postData).eq('id', postId);
                 } else {
                     query = supabase.from('gallery_posts').insert(postData);
                 }

                 const { error: dbError } = await query;
                 if (dbError) throw dbError;

                 messageEl.textContent = `Post ${isEditing ? 'updated' : 'created'} successfully!`;
                 messageEl.style.color = 'green';
                 resetForm();
                 loadPosts();

             } catch (error) {
                 messageEl.textContent = `Error: ${error.message}`;
                 messageEl.style.color = 'red';
             }
         });

         // --- Event Delegation for Edit/Delete ---
         postsContainer.addEventListener('click', async (e) => {
             const target = e.target;

             // Handle Edit
             if (target.classList.contains('edit-btn')) {
                 const postId = target.dataset.id;
                 const { data, error } = await supabase.from('gallery_posts').select('*').eq('id', postId).single();
                 if (error) { alert('Could not fetch post to edit.'); return; }

                 formTitle.textContent = 'Edit Post';
                 postIdInput.value = data.id;
                 titleInput.value = data.title;
                 descriptionInput.value = data.description;
                 imagePreview.src = data.image_url;
                 imagePreview.style.display = 'block';
                 imageInput.required = false; // Not required when editing
                 cancelEditBtn.style.display = 'inline-block';
                 window.scrollTo(0, 0); // Scroll to top to see the form
             }

             // Handle Delete
             if (target.classList.contains('delete-btn')) {
                 const postId = target.dataset.id;
                 const imageUrl = target.dataset.imageUrl;

                 if (!confirm('Are you sure you want to delete this post?')) return;

                 try {
                     // 1. Delete from database
                     const { error: dbError } = await supabase.from('gallery_posts').delete().eq('id', postId);
                     if (dbError) throw dbError;

                     // 2. Delete from storage
                     const imagePath = imageUrl.split('/gallery-images/')[1];
                     const { error: storageError } = await supabase.storage.from('gallery-images').remove([imagePath]);
                     if (storageError) console.warn('DB record deleted, but storage file may remain:', storageError.message);

                     alert('Post deleted successfully.');
                     loadPosts();

                 } catch (error) {
                     alert(`Error deleting post: ${error.message}`);
                 }
             }
         });

         // --- Initial Load ---
         resetForm();
         loadPosts();
     };

    /**
     * Sets up the applications management section.
     */
    const setupApplicationsManagement = async () => {
        const container = document.getElementById('applications-container');
        const modal = document.getElementById('application-modal');
        const modalName = document.getElementById('modal-applicant-name');
        const modalDetails = document.getElementById('modal-application-details');
        const closeModalBtn = document.querySelector('.close-modal');

        container.innerHTML = '<p>Loading applications...</p>';

        const { data: applications, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            container.innerHTML = `<p style="color: red;">Error loading applications: ${error.message}</p>`;
            return;
        }

        if (applications.length === 0) {
            container.innerHTML = '<p>No applications have been submitted yet.</p>';
            return;
        }

        // Create a table to display applications
        const table = document.createElement('table');
        table.className = 'applications-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Date Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        applications.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.first_name} ${app.last_name}</td>
                <td>${app.grade_level}</td>
                <td>${new Date(app.created_at).toLocaleDateString()}</td>
                <td>
                    <select class="status-select" data-id="${app.id}">
                        <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Reviewed" ${app.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
                        <option value="Approved" ${app.status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn btn-secondary" data-id="${app.id}">View</button>
                        <button class="delete-app-btn btn-danger" data-id="${app.id}">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        container.innerHTML = '';
        container.appendChild(table);

        // --- Event Listeners for table actions ---

        // View button
        container.addEventListener('click', async e => {
            if (e.target.classList.contains('view-btn')) {
                const appId = e.target.dataset.id;
                const appData = applications.find(a => a.id == appId);
                if (appData) {
                    openModal(appData);
                }
            }

            // Delete button
            if (e.target.classList.contains('delete-app-btn')) {
                const appId = e.target.dataset.id;
                const row = e.target.closest('tr'); // Find the table row

                if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
                    const { error: deleteError } = await supabase
                        .from('applications')
                        .delete()
                        .eq('id', appId);
                    if (deleteError) {
                        alert(`Failed to delete application: ${deleteError.message}`);
                    } else {
                        row.remove(); // Instantly remove the row from the table
                    }
                }
            }
        });

        // Status change
        container.addEventListener('change', async e => {
            if (e.target.classList.contains('status-select')) {
                const appId = e.target.dataset.id;
                const newStatus = e.target.value;
                const { error } = await supabase
                    .from('applications')
                    .update({ status: newStatus })
                    .eq('id', appId);

                if (error) {
                    alert(`Failed to update status: ${error.message}`);
                } else {
                    // Optionally show a success message
                }
            }
        });

        // --- Modal Logic ---
        const openModal = (appData) => {
            modalName.textContent = `Application for ${appData.first_name} ${appData.last_name}`;
            let detailsHtml = '';
            // Exclude some fields from the modal view for brevity
            const excludedFields = ['id', 'created_at', 'status'];
            for (const [key, value] of Object.entries(appData)) {
                if (value && !excludedFields.includes(key)) {
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    detailsHtml += `<p><strong>${label}:</strong> ${value}</p>`;
                }
            }
            modalDetails.innerHTML = detailsHtml;
            modal.style.display = 'block';
        };

        const closeModal = () => {
            modal.style.display = 'none';
        };

        closeModalBtn.addEventListener('click', closeModal);
        window.addEventListener('click', e => {
            if (e.target == modal) {
                closeModal();
            }
        });
    };

    /**
     * Sets up the contact messages management section.
     */
    const setupMessagesManagement = async () => {
        const container = document.getElementById('messages-container');
        container.innerHTML = '<p>Loading messages...</p>';

        const { data: messages, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            container.innerHTML = `<p style="color: red;">Error loading messages: ${error.message}</p>`;
            return;
        }

        if (messages.length === 0) {
            container.innerHTML = '<p>No messages have been received yet.</p>';
            return;
        }

        container.innerHTML = ''; // Clear loading message

        messages.forEach(msg => {
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card';
            messageCard.style.cssText = `
                background: #f9f9f9;
                border-left: 4px solid ${msg.status === 'New' ? '#007BFF' : '#ccc'};
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 4px;
                cursor: pointer;
            `;

            messageCard.innerHTML = `
                <div class="message-header" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
                    <strong>From: ${msg.name}</strong>
                    <span style="color: #666;">${new Date(msg.created_at).toLocaleString()}</span>
                </div>
                <p class="message-subject" style="margin: 8px 0; font-weight: 500;">${msg.subject}</p>
                <div class="message-body" style="display: none; margin-top: 10px; line-height: 1.6;">
                    <p>${msg.message.replace(/\n/g, '<br>')}</p>
                    <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                    <div class="message-actions" style="display: flex; gap: 10px; align-items: center;">
                        <button class="delete-msg-btn btn-danger" data-id="${msg.id}">Delete</button>
                        ${msg.status === 'New' ? `<button class="mark-read-btn btn-secondary" data-id="${msg.id}">Mark as Read</button>` : ''}
                        <a href="mailto:${msg.email}" class="btn-primary" style="text-decoration: none;">Reply</a>
                    </div>
                </div>
            `;
            container.appendChild(messageCard);
        });

        // Event delegation for message cards
        container.addEventListener('click', async (e) => {
            const card = e.target.closest('.message-card');
            if (!card) return;

            // Handle delete button
            if (e.target.classList.contains('delete-msg-btn')) {
                const msgId = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this message?')) {
                    const { error: deleteError } = await supabase.from('contact_messages').delete().eq('id', msgId);
                    if (deleteError) {
                        alert(`Failed to delete message: ${deleteError.message}`);
                    } else {
                        card.remove();
                    }
                }
                return; // Stop further processing
            }

            // Handle mark as read button
            if (e.target.classList.contains('mark-read-btn')) {
                const msgId = e.target.dataset.id;
                const { error: updateError } = await supabase.from('contact_messages').update({ status: 'Read' }).eq('id', msgId);
                if (updateError) {
                    alert(`Failed to update status: ${updateError.message}`);
                } else {
                    card.style.borderLeftColor = '#ccc';
                    e.target.remove(); // Remove the button
                }
                return; // Stop further processing
            }

            // Toggle message body visibility
            const body = card.querySelector('.message-body');
            if (body) {
                body.style.display = body.style.display === 'none' ? 'block' : 'none';
            }
        });
    };

     // If we are on the admin page, protect it.
     if (window.location.pathname.endsWith('admin.html')) {
         protectPage();
     }
});