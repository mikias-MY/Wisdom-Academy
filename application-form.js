document.addEventListener('DOMContentLoaded', () => {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('Supabase client not initialized.');
        return;
    }

    const form = document.getElementById('school-application-form');
    const messageContainer = document.getElementById('form-message-container');
    const messageIcon = document.getElementById('form-message-icon');
    const messageText = document.getElementById('form-message-text');

    const showMessage = (type, text) => {
        messageContainer.className = type; // 'success', 'error', or 'pending'
        messageText.textContent = text;

        if (type === 'success') {
            messageIcon.className = 'fas fa-check-circle';
        } else if (type === 'error') {
            messageIcon.className = 'fas fa-times-circle';
        } else if (type === 'pending') {
            messageIcon.className = 'fas fa-spinner';
            messageIcon.style.animation = 'spin 2s linear infinite';
        } else {
            messageIcon.style.animation = 'none';
        }

        messageContainer.style.display = 'flex';
    };

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            // Show a pending message
            showMessage('pending', 'Submitting your application...');

            const formData = new FormData(form);
            const formProps = Object.fromEntries(formData);

            // Remove empty optional fields so they don't cause issues
            for (const key in formProps) {
                if (formProps[key] === '') {
                    delete formProps[key];
                }
            }

            const { error } = await supabase.from('applications').insert([formProps]);

            if (error) {
                console.error('Error submitting application:', error);
                showMessage('error', `Error: ${error.message}. Please try again.`);
            } else {
                showMessage('success', 'Application submitted successfully! We will get back to you soon.');
                form.reset();
            }
        });
    }
});