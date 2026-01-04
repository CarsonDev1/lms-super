# LMS Admin Panel

React 18 + Vite + TypeScript admin panel for LMS system.

## Tech Stack

-   **React 18** - UI library
-   **TypeScript** - Type safety
-   **Vite** - Build tool
-   **Ant Design** - UI components
-   **SCSS** - Styling
-   **Axios** - HTTP client
-   **Zustand** - State management
-   **React Router** - Routing

## Getting Started

### Install dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable components
├── pages/           # Page components
├── stores/          # Zustand stores
├── styles/          # Global styles and variables
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```
