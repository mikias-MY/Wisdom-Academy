document.addEventListener('DOMContentLoaded', () => {
    // Use the globally initialized Supabase client
    const supabase = window.supabaseClient;
    if (!supabase) { console.error('Supabase client not initialized globally.'); return; }
    /**
     * Starts the number counting animation for elements with a 'data-target' attribute.
     * @param {HTMLElement} container - The parent element containing the counters.
     */
    const startCountingAnimation = (container) => {
        const counters = container.querySelectorAll('h2[data-target]');
        counters.forEach(counter => {
            const target = +counter.dataset.target;
            const suffix = counter.innerText.replace(/[0-9]/g, '');
            let current = 0;
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // Smooth increment

            const updateCount = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current) + suffix;
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target + suffix;
                }
            };
            requestAnimationFrame(updateCount);
        });
    };

    /**
     * Fetches school stats from Supabase and updates the DOM.
     */
    const loadSchoolStats = async () => {
        // Find the elements to update
        const studentsStatEl = document.getElementById('stats-students');
        const teachersStatEl = document.getElementById('stats-teachers');
        const gradesStatEl = document.getElementById('stats-grades');
        const statsContainer = document.querySelector('.home-number-stats');

        // Only proceed if the main container exists
        if (!statsContainer || !studentsStatEl || !teachersStatEl || !gradesStatEl) {
            return;
        }

        // Fetch the data from the 'school_stats' table
        const { data, error } = await supabase
            .from('school_stats')
            .select('*')
            .eq('id', 1) // We are fetching the single row with id=1
            .single();

        if (error) {
            console.error('Error fetching public school stats:', error.message);
            // If there's an error, animate with the default hardcoded values
            startCountingAnimation(statsContainer);
        } else if (data) {
            // Update the elements with the data from Supabase
            studentsStatEl.setAttribute('data-target', data.students_enrolled);
            teachersStatEl.setAttribute('data-target', data.qualified_teachers);
            gradesStatEl.textContent = data.grade_level_text;

            // Now that the data is updated, start the animation
            const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startCountingAnimation(statsContainer);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            statsObserver.observe(statsContainer);
        }
    };

    // Load the stats when the page is ready
    loadSchoolStats();
});