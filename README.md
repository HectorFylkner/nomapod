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

## Deployment

This React/Vite application requires a **build step** before deployment.

**GitHub Pages Deployment (Recommended):**

1.  **Configure GitHub Pages:** In your repository settings under "Pages", ensure the source is set to "GitHub Actions".
2.  **Add GitHub Actions Workflow:** Create a file named `.github/workflows/deploy.yml` with the appropriate workflow steps to build and deploy your Vite application. This typically involves:
    *   Checking out the code.
    *   Setting up Node.js.
    *   Running `npm install`.
    *   Running `npm run build`.
    *   Using an action (like `peaceiris/actions-gh-pages`) to deploy the contents of the `dist` directory to the `gh-pages` branch or directly to GitHub Pages.

    *(Refer to the [Vite documentation for deploying to GitHub Pages](https://vitejs.dev/guide/static-deploy.html#github-pages) for specific workflow examples.)*

**Other Static Hosting Platforms (Netlify, Vercel, Cloudflare Pages, etc.):**

1.  Connect your GitHub repository to the hosting provider.
2.  Configure the build settings:
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `dist`

These platforms will typically automatically detect Vite, install dependencies, run the build command, and deploy the resulting `dist` directory.

## Customization

*   **Products:** Modify the `/public/products.json` file to change product details, prices, or images.
*   **Swish Number:** Update the `SWISH_NUMBER` constant, currently located within `src/components/PaymentInfo.jsx`. Consider moving this to a dedicated configuration file (e.g., `src/config.js`) for better organization.
*   **Styling:** Modify CSS variables in `src/index.css` or component-specific styles in `src/App.css`.
*   **Logo:** Replace the `/public/nomapod.png` file. 