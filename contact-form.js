document.addEventListener('DOMContentLoaded', () => {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('Supabase client not initialized.');
        return;
    }

    const form = document.getElementById('contact-form');
    const messageContainer = document.getElementById('contact-form-message-container');
    const messageIcon = document.getElementById('contact-form-message-icon');
    const messageText = document.getElementById('contact-form-message-text');

    const showMessage = (type, text) => {
        messageContainer.className = `form-message-box ${type}`;
        messageText.textContent = text;

        if (type === 'success') {
            messageIcon.className = 'fas fa-check-circle';
        } else if (type === 'error') {
            messageIcon.className = 'fas fa-times-circle';
        } else if (type === 'pending') {
            messageIcon.className = 'fas fa-spinner fa-spin';
        }

        messageContainer.style.display = 'flex';
    };

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage('pending', 'Sending your message...');

            const formData = new FormData(form);
            const formProps = Object.fromEntries(formData);

            const { error } = await supabase.from('contact_messages').insert([formProps]);

            if (error) {
                console.error('Error submitting message:', error);
                showMessage('error', `Error: ${error.message}. Please try again.`);
            } else {
                showMessage('success', 'Message sent successfully! We will get back to you soon.');
                form.reset();
                setTimeout(() => {
                    messageContainer.style.display = 'none';
                }, 5000); // Hide message after 5 seconds
            }
        });
    }
});