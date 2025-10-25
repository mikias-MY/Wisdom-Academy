document.addEventListener('DOMContentLoaded', () => {
    const supabaseUrl = 'https://etctvybcscrdodwqkfwh.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3R2eWJjc2NyZG9kd3FrZndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDg1ODAsImV4cCI6MjA3NTcyNDU4MH0.0s2i6svf3mMBPUUiwmeuNza5uCxHZd4pTgew_Z_ksoM';

    // Initialize Supabase client once and make it globally accessible
    if (!window.supabaseClient) {
        window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
});