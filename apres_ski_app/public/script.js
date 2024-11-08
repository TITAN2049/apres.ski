// Function to display the selected form section and hide others
function showForm(formId) {
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(formId).classList.add('active');
}

document.addEventListener('DOMContentLoaded', async () => {
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    const mailingStateSelect = document.getElementById('mailing_state');
    const sameAddressCheckbox = document.getElementById('same_address_checkbox');
    const mailingAddressSection = document.getElementById('mailing_address_section');
    const physicalAddress = document.getElementById('physical_address');
    const zipcode = document.getElementById('zipcode');
    const toggleFormButton = document.getElementById('toggleFormButton');
    const addBusinessForm = document.getElementById('addBusinessForm');
    const closeFormButton = document.getElementById('closeFormButton');
    const businessListContainer = document.getElementById('businessListContainer');
    const skiTownDropdown = document.getElementById('ski_town');
    const organizerDropdown = document.getElementById('organizers');
    const venueDropdown = document.getElementById('venue');
    const addEventButton = document.getElementById('addEventButton');
    const addEventForm = document.getElementById('addEventForm');

    // Reset Add Business Form
    function resetAddBusinessForm() {
        const form = document.getElementById('businessForm');
        form.reset();
        form.removeAttribute('data-business-id');
    }

    // Toggle Add Business form visibility
    toggleFormButton.addEventListener('click', () => {
        if (addBusinessForm.style.display === 'none' || addBusinessForm.style.display === '') {
            resetAddBusinessForm();
            addBusinessForm.style.display = 'block';
            toggleFormButton.textContent = 'Hide Form';
        } else {
            addBusinessForm.style.display = 'none';
            toggleFormButton.textContent = 'Add Business';
        }
    });

    // Close form on "Close" button click
    closeFormButton.addEventListener('click', () => {
        addBusinessForm.style.display = 'none';
        toggleFormButton.textContent = 'Add Business';
    });

    // Toggle Add Event form visibility
    addEventButton.addEventListener('click', () => {
        if (addEventForm.style.display === 'none' || addEventForm.style.display === '') {
            addEventForm.style.display = 'block';
            addEventButton.textContent = 'Hide Event Form';
        } else {
            addEventForm.style.display = 'none';
            addEventButton.textContent = 'Add Event';
        }
    });

    // Form submission for adding or updating an event
document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const selectedCategories = Array.from(document.getElementById('categories').selectedOptions).map(option => option.value);
    const eventDetails = {
        ski_town_id: formData.get('ski_town_id'),
        organizer_ids: formData.get('organizer_ids'),
        venue_id: formData.get('venue_id'),
        event_title: formData.get('event_title'),
        start_date: formData.get('start_date'),
        start_time: formData.get('start_time'),
        end_date: formData.get('end_date'),
        end_time: formData.get('end_time'),
        repeat_type: formData.get('repeat_type'),
        description: formData.get('description'),
        is_featured: formData.get('is_featured') === 'on',
        cost: formData.get('cost'),
        ticket_link: formData.get('ticket_link'),
        categories: selectedCategories // Pass selected categories
    };

    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventDetails)
        });

        if (response.ok) {
            alert('Event added successfully!');
            loadEvents(); // Refresh event list if needed
        } else {
            console.error('Failed to add event');
        }
    } catch (error) {
        console.error('Error submitting event form:', error);
    }
});


    // Load States dynamically
    async function loadStates() {
        try {
            const response = await fetch('/api/states');
            const states = await response.json();
            stateSelect.innerHTML = '<option value="">Select State</option>';
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state.state_id;
                option.textContent = state.state_name;
                stateSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading states:', error);
        }
    }
    
    async function loadCitiesByState(stateId) {
        try {
            const response = await fetch(`/api/cities?state_id=${stateId}`);
            const cities = await response.json();
            citySelect.innerHTML = '<option value="">Select City</option>';
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.city_id;
                option.textContent = city.city_name;
                citySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    }
    
    stateSelect.addEventListener('change', (e) => {
        const selectedStateId = e.target.value;
        if (selectedStateId) {
            loadCitiesByState(selectedStateId);
        } else {
            citySelect.innerHTML = '<option value="">Select City</option>';
        }
    });
    
    // Checkbox event listener for same address
    sameAddressCheckbox.addEventListener('change', () => {
        if (sameAddressCheckbox.checked) {
            mailingAddressSection.style.display = 'none';
            mailingAddress.value = physicalAddress.value;
            mailingCity.value = citySelect.options[citySelect.selectedIndex]?.text || '';
            mailingState.value = stateSelect.options[stateSelect.selectedIndex]?.text || '';
            mailingZip.value = zipcode.value;
        } else {
            mailingAddressSection.style.display = 'block';
            mailingAddress.value = '';
            mailingCity.value = '';
            mailingState.value = '';
            mailingZip.value = '';
        }
    });

    // Load Ski Towns for the event form
    async function loadSkiTowns() {
        try {
            const response = await fetch('/api/cities');
            const towns = await response.json();
            skiTownDropdown.innerHTML = '<option value="">Select Ski Town</option>';
            towns.forEach(town => {
                const option = document.createElement('option');
                option.value = town.city_id;
                option.textContent = town.city_name;
                skiTownDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading ski towns:', error);
        }
    }

    // Load organizers based on selected Ski Town
    skiTownDropdown.addEventListener('change', async () => {
        const selectedTownId = skiTownDropdown.value;
        try {
            const response = await fetch(`/api/businesses?city_id=${selectedTownId}`);
            const businesses = await response.json();

            organizerDropdown.innerHTML = '<option value="">Select Organizer</option>';
            businesses.forEach(business => {
                const option = document.createElement('option');
                option.value = business.business_id;
                option.textContent = business.venue_name;
                organizerDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading organizers:', error);
        }
    });

    // Load all businesses and render them as cards
    async function loadBusinesses() {
        try {
            const response = await fetch('/api/businesses');
            const businesses = await response.json();
            businessListContainer.innerHTML = '';
            businesses.forEach(business => {
                const businessCardHTML = `
                    <div class="business-card" data-id="${business.business_id}">
                        <h3>${business.venue_name}</h3>
                        <p><strong>Classification:</strong> ${business.classification}</p>
                        <p><strong>Physical Address:</strong> ${business.physical_address}, Zip: ${business.zipcode}</p>
                        <p><strong>City ID:</strong> ${business.city_id}</p>
                        <p><strong>Best of Apres-Ski:</strong> ${business.best_of_apres_ski ? 'Yes' : 'No'}</p>
                        <p><strong>Website:</strong> <a href="${business.website_url}" target="_blank">Visit Site</a></p>
                        <p><strong>Facebook:</strong> <a href="${business.facebook_page}" target="_blank">Facebook</a></p>
                        <p><strong>Instagram:</strong> <a href="${business.instagram_page}" target="_blank">Instagram</a></p>
                        <p><strong>X Page:</strong> <a href="${business.x_page}" target="_blank">X Page</a></p>
                        <button onclick="editBusiness(${business.business_id})">Edit</button>
                        <button onclick="deleteBusiness(${business.business_id})">Delete</button>
                    </div>`;
                businessListContainer.innerHTML += businessCardHTML;
            });
        } catch (error) {
            console.error('Error loading businesses:', error);
        }
    }

    // Form submission for adding or updating a business
    document.getElementById('businessForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const businessId = e.target.getAttribute('data-business-id');
        const endpoint = businessId ? `/api/businesses/${businessId}` : '/api/add-business';
        const method = businessId ? 'PUT' : 'POST';

        try {
            const response = await fetch(endpoint, { method, body: formData });
            if (response.ok) {
                alert(businessId ? 'Business updated successfully!' : 'Business added successfully!');
                await loadBusinesses();
                resetAddBusinessForm();
                addBusinessForm.style.display = 'none';
                toggleFormButton.textContent = 'Add Business';
            } else {
                const errorText = await response.text();
                console.error("Unexpected server response:", errorText);
                alert('An error occurred. Please check the console for details.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An unexpected error occurred. Please check the console for details.');
        }
    });

    // Edit a business function
    window.editBusiness = async function(businessId) {
        try {
            const response = await fetch(`/api/businesses/${businessId}`);
            const business = await response.json();

            document.getElementById('venue_name').value = business.venue_name;
            document.getElementById('best_of_apres_ski').value = business.best_of_apres_ski ? 'true' : 'false';
            document.getElementById('classification').value = business.classification;
            document.getElementById('physical_address').value = business.physical_address;
            document.getElementById('city').value = business.city_id;
            document.getElementById('state').value = business.state_id;
            document.getElementById('zipcode').value = business.zipcode;
            document.getElementById('website_url').value = business.website_url;
            document.getElementById('facebook_page').value = business.facebook_page;
            document.getElementById('instagram_page').value = business.instagram_page;
            document.getElementById('x_page').value = business.x_page;

            addBusinessForm.style.display = 'block';
            toggleFormButton.textContent = 'Hide Form';
            document.getElementById('businessForm').setAttribute('data-business-id', businessId);
        } catch (error) {
            console.error('Error editing business:', error);
        }
    };

    // Delete a business function
    window.deleteBusiness = async function(businessId) {
        if (!confirm("Are you sure you want to delete this business?")) return;

        try {
            const response = await fetch(`/api/businesses/${businessId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Business deleted successfully');
                await loadBusinesses();
            } else {
                alert('Failed to delete business');
            }
        } catch (error) {
            console.error('Error deleting business:', error);
        }
    };
    async function loadBusinessesByCity(cityId) {
        try {
            const response = await fetch(`/api/businesses?city_id=${cityId}`);
            const businesses = await response.json();
            organizerDropdown.innerHTML = '<option value="">Select Organizer</option>';
            businesses.forEach(business => {
                const option = document.createElement('option');
                option.value = business.business_id;
                option.textContent = business.venue_name;
                organizerDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading businesses:', error);
        }
    }
    
    citySelect.addEventListener('change', (e) => {
        const selectedCityId = e.target.value;
        if (selectedCityId) {
            loadBusinessesByCity(selectedCityId);
        } else {
            organizerDropdown.innerHTML = '<option value="">Select Organizer</option>';
        }
    });

    document.addEventListener('DOMContentLoaded', async () => {
        await loadStates(); // Load all states initially
    
        addEventButton.addEventListener('click', () => {
            addEventForm.style.display = addEventForm.style.display === 'none' ? 'block' : 'none';
        });
    });
    
    

    // Load data on page load
    await loadStates();
    await loadSkiTowns();
    await loadBusinesses();
});
