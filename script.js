// Configuration
const SWISH_NUMBER = "070-4228605";

document.addEventListener('DOMContentLoaded', async () => { // Make listener async
    // Get references to elements
    const productListElement = document.getElementById('product-list');
    const totalPriceElement = document.getElementById('total-price');
    const phoneInput = document.getElementById('phone-number');
    const paymentButton = document.getElementById('payment-button');
    const paymentButtonText = paymentButton.querySelector('span');
    const paymentInfoSection = document.getElementById('payment-info');
    const paymentAmountElement = document.getElementById('payment-amount');
    const phoneDisplayElement = document.getElementById('phone-display');
    const selectedItemsListElement = paymentInfoSection.querySelector('ul');
    const cancelPaymentButton = document.getElementById('cancel-payment');
    const phoneErrorElement = document.getElementById('phone-error');
    const swishNumberDisplayElement = document.getElementById('swish-number-display'); // Get Swish display span

    // --- Fetch Products --- moved up
    let products = [];
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
    } catch (error) {
        console.error("Could not load products:", error);
        productListElement.innerHTML = '<p style="color: red;">Error loading products. Please try again later.</p>';
        // Optionally disable functionality or show a more prominent error
        return; // Stop execution if products can't be loaded
    }

    // --- Load products into the list ---
    function loadProducts() {
        productListElement.innerHTML = ''; // Clear existing list (e.g., error message)
        products.forEach(product => {
            const label = document.createElement('label');
            label.htmlFor = product.id;
            label.tabIndex = 0;
            label.addEventListener('keydown', (e) => {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = product.id;
            checkbox.name = 'product';
            checkbox.value = product.price;
            checkbox.dataset.name = product.name;

            const img = document.createElement('img');
            img.src = product.imgSrc;
            img.alt = product.altText;
            img.className = 'product-image';
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

            checkbox.addEventListener('change', () => {
                label.classList.toggle('selected-product', checkbox.checked);
                updateState();
            });
        });
    }

    loadProducts(); // Call function to load products

    // --- Add event listeners ---
    phoneInput.addEventListener('input', updateState);

    paymentButton.addEventListener('click', () => {
        if (!paymentButton.disabled && !paymentButton.classList.contains('loading')) {
            paymentButton.classList.add('loading');
            paymentInfoSection.classList.remove('waiting-for-sms');

            setTimeout(() => {
                const currentTotal = calculateTotalPrice();
                paymentAmountElement.textContent = currentTotal;
                phoneDisplayElement.textContent = phoneInput.value;
                swishNumberDisplayElement.textContent = SWISH_NUMBER; // Set Swish number from constant

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
                paymentButton.classList.remove('loading');

                setTimeout(() => {
                    paymentInfoSection.classList.add('waiting-for-sms');
                }, 500);
            }, 300);
        }
    });

    cancelPaymentButton.addEventListener('click', () => {
        paymentInfoSection.classList.remove('visible');
        paymentInfoSection.classList.remove('waiting-for-sms');
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

        totalPriceElement.textContent = currentTotal;
        if (currentTotal !== oldTotal) {
            totalPriceElement.style.transition = 'none';
            totalPriceElement.style.transform = 'scale(1.1)';
            totalPriceElement.style.color = 'var(--primary-color)';
            setTimeout(() => {
                totalPriceElement.style.transition = 'transform 0.2s ease, color 0.2s ease';
                totalPriceElement.style.transform = 'scale(1)';
                totalPriceElement.style.color = '';
            }, 50);
        }

        const phoneNumber = phoneInput.value.trim();
        const hasPhoneNumber = phoneNumber !== '';
        const isPhoneValid = phoneNumber.length === 10 && phoneInput.checkValidity();
        const isProductSelected = currentTotal > 0;

        if (hasPhoneNumber && !isPhoneValid) {
            phoneErrorElement.style.display = 'block';
            phoneInput.classList.add('input-error'); // Add error class to input
        } else {
            phoneErrorElement.style.display = 'none';
            phoneInput.classList.remove('input-error'); // Remove error class from input
        }

        const canPay = isProductSelected && isPhoneValid;
        paymentButton.disabled = !canPay;

        if (!canPay) {
            let reason = 'Please ';
            if (!isProductSelected && !isPhoneValid) {
                reason += 'select a product and enter a valid phone number.';
            } else if (!isProductSelected) {
                reason += 'select a product.';
            } else {
                reason += 'enter a valid 10-digit phone number (07XXXXXXXX).';
            }
            paymentButton.title = reason;
        } else {
            paymentButton.removeAttribute('title');
        }

        if (paymentInfoSection.classList.contains('visible') && !canPay) {
           paymentInfoSection.classList.remove('visible');
           paymentInfoSection.classList.remove('waiting-for-sms');
        }
    }

    // Initial state update
    updateState();
}); 