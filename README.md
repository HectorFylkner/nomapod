# nomapod - Payment UI (React Version)

## Description

This project contains the React-based frontend for the nomapod payment interface. It provides a simple, mobile-first, single-page application designed as the user interface for purchasing items from a nomapod unit. It's intended to be accessed by users scanning a QR code on the physical unit.

The page allows users to:
1.  View available products loaded dynamically.
2.  Select one or more products.
3.  See the total price update in real-time.
4.  Enter their phone number (Swedish format validation).
5.  Proceed to a secure payment form powered by Stripe Elements.
6.  Pay using various methods supported by Stripe (including cards and potentially digital wallets like Apple Pay/Google Pay).

**Note:** This application integrates with Stripe for payment processing. It uses Vercel Serverless Functions for backend operations like creating Payment Intents and handling Stripe webhooks.

## Purpose

The primary goal is to provide a functional and user-friendly interface for selecting products and completing payments securely via Stripe. This version uses React and Vite for improved structure, maintainability, and developer experience.

## Features

*   Component-based UI built with React.
*   Fast development server and optimized build process powered by Vite.
*   Dynamic product list loaded from `/public/products.json`.
*   Checkbox-based multiple product selection.
*   Real-time calculation and display of the total price.
*   Required phone number input with client-side validation (10 digits, Swedish format).
*   Secure payment processing integrated using Stripe Elements (`CheckoutForm`).
*   Backend API routes (`/api`) built as Vercel Serverless Functions:
    *   `/api/create-payment-intent`: Creates a Stripe PaymentIntent.
    *   `/api/webhook`: Handles incoming events from Stripe (e.g., payment success/failure).
*   Minimalist, responsive design optimized for mobile devices.

## Technology Stack

*   **React:** JavaScript library for building user interfaces.
*   **Vite:** Fast frontend build tool and development server.
*   **JavaScript (ES6+):** Core language for application logic.
*   **CSS3:** Styling (`src/App.css`, `src/index.css`).
*   **HTML5:** Structure provided by `index.html` and JSX within React components.
*   **Stripe Elements:** Secure UI components for collecting payment details.
*   **Vercel:** Hosting platform for frontend and serverless backend functions.

## Project Structure

*   **`public/`**: Contains static assets that are copied directly to the build output.
    *   `products.json`: Default product data.
    *   `nomapod.png`: Logo.
    *   `*.webp`: Product images.
    *   *(Potentially `.well-known/` for Apple Pay verification)*
*   **`src/`**: Contains the React application source code.
    *   `main.jsx`: Application entry point.
    *   `App.jsx`: Main application component managing state and layout.
    *   `App.css`, `index.css`: CSS files.
    *   **`components/`**: Directory containing reusable React components (e.g., `ProductList`, `PhoneInput`, `CheckoutForm`).
*   **`api/`**: Contains Vercel Serverless Functions for backend logic.
    *   `create-payment-intent.js`: Handles Stripe PaymentIntent creation.
    *   `webhook.js`: Handles incoming Stripe webhooks.
*   **`index.html`**: The main HTML template Vite uses.
*   **`package.json`**: Project metadata and dependencies.
*   **`vite.config.js`**: Vite configuration file.
*   **`.gitignore`**: Specifies intentionally untracked files for Git.
*   **`.env.local`**: Local environment variables (ignored by Git). Should contain `VITE_STRIPE_PUBLISHABLE_KEY` for local development.

## Local Development

1.  **Prerequisites:** Node.js (which includes npm) installed.
2.  **Clone Repository:** `git clone <repository-url>`
3.  **Navigate:** `cd nomapod-website` (or your repository directory name)
4.  **Install Dependencies:**
    ```bash
    npm install
    ```
5.  **Environment Variables (Local):** Create a `.env.local` file in the project root and add your **Test** Stripe Publishable Key:
    ```dotenv
    VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxx
    ```
    *(Note: For local development hitting the deployed Vercel API routes, you don't strictly need the secret keys locally, as the backend functions run on Vercel. If running a local backend server, you'd need the secrets too.)*
6.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite dev server (typically at `http://localhost:5173`).

## Building for Production

To create an optimized build for deployment:

```bash
npm run build
```
This command generates a `dist` directory containing the static frontend assets. Vercel typically runs this command automatically during deployment.

## Environment Variables (Vercel)

Before deploying or redeploying on Vercel, ensure the following environment variables are set in your Vercel project **Settings → Environment Variables**, configured for the **Production** environment (and Preview/Development as needed):

*   **`VITE_STRIPE_PUBLISHABLE_KEY`**: Your **Live** Stripe Publishable Key (`pk_live_...`). This is used by the frontend (Vite build).
*   **`STRIPE_SECRET_KEY`**: Your **Live** Stripe Secret Key (`sk_live_...`). Used by the `/api` routes.
*   **`STRIPE_WEBHOOK_SECRET`**: Your **Live** Stripe Webhook Signing Secret (`whsec_...`). Used by the `/api/webhook` route.

## Deployment

This project is configured for deployment on Vercel, utilizing its seamless integration with Git and its handling of Serverless Functions in the `/api` directory.

1.  **Connect Repository:** Ensure your GitHub repository is connected to a Vercel project.
2.  **Configure Environment Variables:** Set the required Stripe keys (Publishable, Secret, Webhook Secret) in Vercel as described above.
3.  **Push to Main Branch:** Committing and pushing changes to the `main` branch (or your configured production branch) will automatically trigger a new build and deployment on Vercel.
4.  **Custom Domain:** Configure your custom domain (e.g., `nomapod.se`) in the Vercel project settings under **Settings → Domains**.

Your live site will be available at your custom domain, and the API endpoints (`/api/create-payment-intent`, `/api/webhook`) will function using the configured environment variables.

## Customization

*   **Products:** Modify the `/public/products.json` file.
*   **Styling:** Modify CSS variables in `src/index.css` or component-specific styles in `src/App.css`.
*   **Logo:** Replace the `/public/nomapod.png` file.
*   **Stripe Integration:** Adjust logic in `src/components/CheckoutForm.jsx`, `/api/create-payment-intent.js`, and `/api/webhook.js` as needed. 