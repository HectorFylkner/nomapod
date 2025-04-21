# nomapod - Payment UI (React Version)

## Description

This project contains the React-based frontend for the nomapod payment interface. It provides a simple, mobile-first, single-page application designed as the user interface for purchasing items from a nomapod unit. It's intended to be accessed by users scanning a QR code on the physical unit.

The page allows users to:
1.  View available products loaded dynamically.
2.  Select one or more products.
3.  See the total price update in real-time.
4.  Enter their phone number (Swedish format validation).
5.  View manual payment instructions for Swish, including the total amount and required Swish message content.

**Important:** This frontend application **simulates** the user flow. It **does not** handle actual payment processing, Swish integration, payment verification, or sending SMS unlock codes. These processes are assumed to be handled manually or by a separate backend system for the MVP stage.

## Purpose

The primary goal is to provide a functional and maintainable user interface for the purchase flow, guiding the user through product selection and providing the necessary information to complete a manual Swish payment. This version uses React and Vite for improved structure, maintainability, and developer experience compared to the original static HTML version.

## Features

*   Component-based UI built with React.
*   Fast development server and optimized build process powered by Vite.
*   Dynamic product list loaded from `/public/products.json`.
*   Checkbox-based multiple product selection.
*   Real-time calculation and display of the total price with visual feedback on change.
*   Required phone number input with client-side validation (10 digits, Swedish format).
*   Visual feedback for invalid phone number input.
*   "Show Payment Info" button enabled only when products are selected and a valid phone number is entered.
*   Tooltip on disabled payment button explaining requirements.
*   Reveals a payment instruction section with:
    *   A summary of the selected items.
    *   The total amount to pay.
    *   The designated Swish number (configured in `src/components/PaymentInfo.jsx` or ideally a central config).
    *   Instructions for the user (include phone number in message, wait for SMS code).
    *   Reminder to close the box and reset the lock after purchase.
*   Minimalist, responsive design optimized for mobile devices.

## Technology Stack

*   **React:** JavaScript library for building user interfaces.
*   **Vite:** Fast frontend build tool and development server.
*   **JavaScript (ES6+):** Core language for application logic.
*   **CSS3:** Styling with CSS Variables, organized via CSS Modules or global stylesheets (`src/App.css`, `src/index.css`).
*   **HTML5:** Structure provided by `index.html` and JSX within React components.

## Project Structure

*   **`public/`**: Contains static assets that are copied directly to the build output.
    *   `products.json`: Default product data.
    *   `nomapod.png`: Logo.
    *   `*.webp`: Product images.
*   **`src/`**: Contains the React application source code.
    *   `main.jsx`: Application entry point.
    *   `App.jsx`: Main application component managing state and layout.
    *   `App.css`, `index.css`: CSS files.
    *   **`components/`**: Directory containing reusable React components (e.g., `ProductList`, `PhoneInput`).
*   **`index.html`**: The main HTML template Vite uses.
*   **`package.json`**: Project metadata and dependencies.
*   **`vite.config.js`**: Vite configuration file.
*   **`.gitignore`**: Specifies intentionally untracked files for Git.

## Local Development

1.  **Prerequisites:** Node.js (which includes npm) installed.
2.  **Clone Repository:** `git clone <repository-url>`
3.  **Navigate:** `cd nomapod-website` (or your repository directory name)
4.  **Install Dependencies:**
    ```bash
    npm install
    ```
5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite dev server (typically at `http://localhost:5173`). The application will automatically reload when you save changes.

## Building for Production

To create an optimized build for deployment:

```bash
npm run build
```
This command generates a `dist` directory containing the static HTML, CSS, and JavaScript files ready for deployment.

## Environment Variables

Before deploying the API routes, you must set the following in your hosting environment (e.g. Vercel):

- `STRIPE_SECRET_KEY` — Your Stripe secret key (sk_test_... or sk_live_...)
- `STRIPE_WEBHOOK_SECRET` — The webhook signing secret (whsec_...)

Ensure each variable is configured for **Production** (and Preview/Development as needed) so that the API routes can read them via `process.env`.

## Deployment

This project now uses Vercel's file-system `api/` directory for backend routes. No custom server configuration is needed.

1.  **Commit & Push** your code, including the `api/` folder.
2.  Go to your Vercel Dashboard and ensure the environment variables listed above are set under **Settings → Environment Variables**.
3.  **Deploy:** Vercel will automatically detect and deploy both the frontend and backend API routes when you push to `main`.

Now your site will be available at `https://<your-project>.vercel.app`, and the endpoints:
- `POST /api/create-payment-intent`
- `POST /api/webhook`

will function correctly. Let me know once you've set the env vars in Vercel and deployed, and we can test the webhook flow again!

## Customization

*   **Products:** Modify the `/public/products.json` file to change product details, prices, or images.
*   **Swish Number:** Update the `SWISH_NUMBER` constant, currently located within `src/components/PaymentInfo.jsx`. Consider moving this to a dedicated configuration file (e.g., `src/config.js`) for better organization.
*   **Styling:** Modify CSS variables in `src/index.css` or component-specific styles in `src/App.css`.
*   **Logo:** Replace the `/public/nomapod.png` file. 