# Leavify - Frontend Application

The frontend of Leavify is a modern, responsive Single Page Application (SPA) built to deliver a premium user experience for managing leaves, reimbursements, and HR tasks.

## 🚀 Technologies Used
- **Core:** React 18, Vite (for ultra-fast development and optimized bundling)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS (utility-first styling for rapid, custom UI and glassmorphism)
- **Icons:** Heroicons & React Icons
- **State Management:** React Context API (`AuthContext`)
- **Data Visualization:** Chart.js & `react-chartjs-2`
- **Calendar Visualization:** `react-big-calendar`
- **HTTP Client:** Axios
- **Date Manipulation:** `date-fns`

## 🏗️ Architecture & Folder Structure
The application uses a modular, component-based architecture.

- `src/components/` - Reusable UI widgets and layout structures (e.g., `Sidebar.jsx`, `Navbar.jsx`, `MetricCard.jsx`). Also houses complex standalone features like `AssistantWidget.jsx`.
- `src/pages/` - Top-level route components representing full screens (e.g., `Dashboard.jsx`, `MyLeaves.jsx`, `AdminPanel.jsx`).
- `src/context/` - Global state managers. `AuthContext.jsx` handles the login/logout lifecycle and holds the authenticated user's profile deeply across the app without prop-drilling.
- `src/services/` - API interaction layer. Specifically, `api.js` configures an Axios instance with base URLs and automatic JWT injection.
- `src/assets/` - Static assets and global CSS (`index.css` featuring base Tailwind directives and custom animation keyframes).

## 🔄 Core Data Flow
If an interviewer asks how the frontend connects to the backend, explain this lifecycle:
1. **Authentication State:** On load, `AuthContext` checks the browser's `localStorage` for a saved JWT token. If found, it fetches the current user's profile from the backend and provides it globally to all React components.
2. **Navigation:** When a user clicks a sidebar link, `react-router-dom` intercepts the URL change. Instead of reloading the page, it instantly swaps out the main content area with the relevant Page component.
3. **Data Fetching:** When a page (like `MyLeaves.jsx`) mounts on screen, it fires a React `useEffect` hook. This triggers an asynchronous call to the backend using Axios.
4. **API Interceptor:** Custom logic in `services/api.js` acts as a middleman. It intercepts the outbound Axios request and automatically attaches the JWT token from `localStorage` to the `Authorization: Bearer <token>` header, ensuring security.
5. **State Update & Render:** The backend returns JSON data. The component saves this data to its local state (`useState`), which triggers React's reconciliation engine to re-render the UI DOM, painting tables/charts with the fresh data.

## ✨ Key Features & UX Decisions
- **Role-Based UI:** The user interface dynamically shifts based on the authenticated user's role (`Employee`, `Manager`, `Admin`). For example, managers see approval queues entirely hidden from standard employees.
- **Micro-Animations & Visuals:** TailwindCSS is pushed to its limits using custom backdrop-blurs (glassmorphism), smooth gradients, and CSS transitions to create a visually striking "Premium Fintech/HR" aesthetic instead of a boring administrative tool.
- **Intelligent Assistant Widget:** A floating, global AI assistant component (`AssistantWidget.jsx`) hooks intimately into the backend. Instead of rendering standard markdown blocks like ChatGPT, it parses the custom JSON (`"table"` or `"stat"`) sent by the backend Gemini integration to dynamically render exact native DOM elements (like statistical grids or HTML tables).

## ⚙️ Setup & Running Locally
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the Vite development server: `npm run dev`
4. Visit the web app at `http://localhost:5173`
