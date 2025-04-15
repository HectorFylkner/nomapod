document.addEventListener('DOMContentLoaded', () => {
    const products = [
        { id: 'prod1', name: 'Coca Cola Zero', price: 20, imgSrc: 'Coca-Cola_Zero.jpg.webp', altText: 'Coca Cola Zero can' },
        { id: 'prod2', name: 'Nocco', price: 20, imgSrc: 'PB-3542_1.jpg.webp', altText: 'Nocco energy drink can' },
        { id: 'prod3', name: 'Barebell Protein Bar', price: 25, imgSrc: 'Barebell.jpg.webp', altText: 'Barebell protein bar' },
        { id: 'prod4', name: 'Gott och Blandat', price: 20, imgSrc: 'GottoBlandat.jpg.webp', altText: 'Bag of Gott och Blandat candy' }
    ];

    // Get references to elements (unchanged IDs)
    const productListElement = document.getElementById('product-list');
    const totalPriceElement = document.getElementById('total-price');
    const phoneInput = document.getElementById('phone-number');
    const paymentButton = document.getElementById('payment-button');
    const paymentButtonText = paymentButton.querySelector('span'); // Get text span for loading state
    const paymentInfoSection = document.getElementById('payment-info');
    const paymentAmountElement = document.getElementById('payment-amount');
    const phoneDisplayElement = document.getElementById('phone-display');
    const selectedItemsListElement = paymentInfoSection.querySelector('ul');
    const cancelPaymentButton = document.getElementById('cancel-payment');
    const phoneErrorElement = document.getElementById('phone-error'); // Get reference to error message element

    // Load products into the list
    products.forEach(product => {
        const label = document.createElement('label');
        label.htmlFor = product.id;
        // Add tabindex for keyboard focusability
        label.tabIndex = 0;
        label.addEventListener('keydown', (e) => {
            // Allow selection with Space or Enter key
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault(); // Prevent default space scroll/enter submit
                checkbox.checked = !checkbox.checked;
                // Manually trigger change event
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = product.id;
        checkbox.name = 'product';
        checkbox.value = product.price;
        checkbox.dataset.name = product.name;
        // Hide actual checkbox visually, use label styling
        // checkbox.style.display = 'none'; // Optional: hide checkbox if label click sufficient

        const img = document.createElement('img');
        img.src = product.imgSrc;
        img.alt = product.altText; // Set alt text from product data
        img.className = 'product-image';
        // Handle image loading errors gracefully
        img.onerror = () => { img.style.display = 'none'; };

        const nameSpan = document.createElement('span');
        nameSpan.className = 'product-name';
        nameSpan.textContent = product.name;

        const priceSpan = document.createElement('span');
        priceSpan.className = 'product-price';
        priceSpan.textContent = `${product.price} SEK`;

        label.appendChild(checkbox);
        label.appendChild(img);
        label.appendChild(nameSpan);
        label.appendChild(priceSpan);
        productListElement.appendChild(label);

        // Add event listener to each checkbox change
        checkbox.addEventListener('change', () => {
            label.classList.toggle('selected-product', checkbox.checked);
            updateState();
        });
    });

    // Add event listener to phone input
    phoneInput.addEventListener('input', updateState);

    // Add event listener to payment button
    paymentButton.addEventListener('click', () => {
        if (!paymentButton.disabled && !paymentButton.classList.contains('loading')) {
            // Add loading state
            paymentButton.classList.add('loading');
            paymentInfoSection.classList.remove('waiting-for-sms'); // Reset state if re-showing

            // Simulate slight delay before showing info
            setTimeout(() => {
                const currentTotal = calculateTotalPrice();
                paymentAmountElement.textContent = currentTotal;
                phoneDisplayElement.textContent = phoneInput.value;

                // Update selected items summary
                selectedItemsListElement.innerHTML = '';
                const selectedCheckboxes = getSelectedCheckboxes();
                if (selectedCheckboxes.length > 0) {
                    selectedCheckboxes.forEach(cb => {
                        const li = document.createElement('li');
                        li.textContent = `${cb.dataset.name} - ${cb.value} SEK`;
                        selectedItemsListElement.appendChild(li);
                    });
                    paymentInfoSection.querySelector('#selected-items-summary').style.display = 'block';
                } else {
                    paymentInfoSection.querySelector('#selected-items-summary').style.display = 'none';
                }

                paymentInfoSection.classList.add('visible');

                // Remove loading state after showing info
                paymentButton.classList.remove('loading');

                // Add 'waiting' class shortly after showing payment info
                // to subtly guide the user to the next step.
                setTimeout(() => {
                    paymentInfoSection.classList.add('waiting-for-sms');
                }, 500); // 0.5 second delay after info appears

                // Optional: Scroll to payment info if needed
                // paymentInfoSection.scrollIntoView({ behavior: 'smooth' });

            }, 300); // 300ms simulated loading delay
        }
    });

     // Add event listener to cancel button
    cancelPaymentButton.addEventListener('click', () => {
        paymentInfoSection.classList.remove('visible');
        paymentInfoSection.classList.remove('waiting-for-sms'); // Remove waiting state on cancel
    });

    // --- Helper Functions ---
     function getSelectedCheckboxes() {
        return productListElement.querySelectorAll('input[type="checkbox"]:checked');
    }
    function calculateTotalPrice() {
        let total = 0;
        getSelectedCheckboxes().forEach(checkbox => {
            total += parseInt(checkbox.value, 10);
        });
        return total;
    }
    function updateState() {
        const currentTotal = calculateTotalPrice();
        const oldTotal = parseInt(totalPriceElement.textContent || '0', 10);

        // Update total with potential animation/highlight (simple example)
        totalPriceElement.textContent = currentTotal;
        if (currentTotal !== oldTotal) {
            totalPriceElement.style.transition = 'none'; // Disable transition for reset
            totalPriceElement.style.transform = 'scale(1.1)';
            totalPriceElement.style.color = 'var(--primary-color)';
            setTimeout(() => {
                totalPriceElement.style.transition = 'transform 0.2s ease, color 0.2s ease'; // Re-enable
                totalPriceElement.style.transform = 'scale(1)';
                totalPriceElement.style.color = ''; // Revert color
            }, 50);
        }

        const phoneNumber = phoneInput.value.trim();
        const hasPhoneNumber = phoneNumber !== ''; // Keep track if user has entered anything
        // Check length and pattern validity
        const isPhoneValid = phoneNumber.length === 10 && phoneInput.checkValidity();
        const isProductSelected = currentTotal > 0;

        // Show/hide phone error message only if something is entered but it's invalid
        if (hasPhoneNumber && !isPhoneValid) {
            phoneErrorElement.style.display = 'block';
        } else {
            phoneErrorElement.style.display = 'none';
        }

        // Enable/disable payment button
        const canPay = isProductSelected && isPhoneValid;
        paymentButton.disabled = !canPay;

        // Set title attribute on disabled button to explain why
        if (!canPay) {
            let reason = 'Please ';
            if (!isProductSelected && !isPhoneValid) {
                reason += 'select a product and enter a valid phone number.';
            } else if (!isProductSelected) {
                reason += 'select a product.';
            } else { // Phone must be invalid
                reason += 'enter a valid 10-digit phone number (07XXXXXXXX).';
            }
            paymentButton.title = reason;
        } else {
            paymentButton.removeAttribute('title'); // Remove title when enabled
        }

        // Hide payment info if conditions are no longer met
        if (paymentInfoSection.classList.contains('visible') && !canPay) {
           paymentInfoSection.classList.remove('visible');
           paymentInfoSection.classList.remove('waiting-for-sms'); // Also remove waiting state
        }
    }

    // Initial state update
    updateState();
}); 