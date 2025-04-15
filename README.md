# nomapod
# nomapod - MVP Payment Landing Page

## Description

This project contains a simple, mobile-first, single-page web application designed as the Minimum Viable Product (MVP) payment landing page for nomapod. It's intended to be accessed by users scanning a QR code on a physical nomapod unit.

The page allows users to:
1.  Select one or more products available in the pod.
2.  See the total price dynamically update.
3.  Enter their phone number.
4.  View manual payment instructions for Swish.

**Important:** This frontend-only application **simulates** the user flow. It **does not** handle actual payment processing, Swish integration, payment verification, or sending SMS unlock codes. These processes are assumed to be handled manually for the MVP stage.

## Purpose

The primary goal is to provide a functional user interface for the initial purchase flow, guiding the user through product selection and providing the necessary information to complete a manual Swish payment. It serves to validate the basic user experience before implementing backend logic.

## Features

*   Dynamic product list loaded from embedded data.
*   Checkbox-based multiple product selection.
*   Real-time calculation and display of the total price.
*   Required phone number input with basic HTML5 validation hints.
*   "Visa betalningsinfo" (Show Payment Info) button enabled only when products are selected and a phone number is entered.
*   Reveals a section with:
    *   A summary of the selected items.
    *   The total amount to pay.
    *   The designated Swish number.
    *   Instructions for the user (include phone number in message, wait for SMS code).
    *   Reminder to close the box and reset the lock after purchase.
*   Minimalist, responsive design optimized for mobile devices.
*   Subtle UI animations and visual feedback for user interactions.

## Technology Stack

*   **HTML5:** Standard semantic structure.
*   **CSS3:** Embedded styles for layout, responsiveness, and minimal aesthetics. Uses CSS variables.
*   **Vanilla JavaScript (ES6+):** For dynamic content loading, UI updates, state management, and event handling. No external libraries or frameworks.

## Project Files

*   `nomapod_pay3.html`: The main HTML file containing the structure, embedded CSS, and JavaScript.
*   `nomapod.png`: The logo image file.
*   `*.webp`/`*.jpg`: Product image files (e.g., `Coca-Cola_Zero.jpg.webp`, `Barebell.jpg.webp`, etc.)

## Setup & Local Testing

No build process is required. To test locally:

1.  **Ensure all files** (`nomapod_pay3.html` and all required image files) are in the same directory.
2.  **Navigate** to this directory in your terminal.
3.  **Start a simple web server.** Python 3 is recommended:
    ```bash
    python3 -m http.server 8080
    ```
    (Use any available port if 8080 is taken).
4.  **Open your browser** and go to `http://localhost:8080/nomapod_pay3.html`.
5.  **To test on a mobile device:**
    *   Ensure the device is on the same Wi-Fi network as the computer running the server (avoid Guest networks, use Personal Hotspot if needed).
    *   Find your computer's local IP address (e.g., using `ipconfig getifaddr en0` on macOS).
    *   Access `http://[YOUR_COMPUTER_IP]:8080/nomapod_pay3.html` from the mobile browser.

## Deployment

As this is a static site (HTML, CSS, JS, images only), it can be easily deployed to various static hosting platforms:

*   **Netlify:** Drag-and-drop the project folder or connect a Git repository.
*   **Vercel:** Connect a Git repository.
*   **GitHub Pages:** Enable Pages deployment directly from a GitHub repository.
*   **Cloudflare Pages:** Connect a Git repository.

These platforms often offer generous free tiers suitable for this type of project and provide HTTPS automatically.

## Customization

*   **Products:** Edit the `products` array in the JavaScript section of `nomapod_pay3.html` to change names, prices, or image paths.
*   **Swish Number:** Update the Swish number displayed within the `#payment-info` section in the HTML and potentially in the JavaScript if needed elsewhere.
*   **Styling:** Modify CSS variables in the `:root` section or specific CSS rules within the `<style>` tags.
*   **Logo:** Replace the `nomapod.png` file or update the `src` attribute of the logo `<img>` tag. 
