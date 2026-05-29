# Relax Vibe - Movie Streaming Website

A modern, responsive movie streaming website built with React and Vite. Relax Vibe provides a smooth, enjoyable experience for discovering and exploring movies.

## Features

- **🎬 Movie Discovery**: Browse and explore a curated collection of movies
- **🔍 Search Functionality**: Easily search for movies by title
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Modern UI**: Beautiful dark theme with smooth animations
- **⚡ Fast Performance**: Built with Vite for lightning-fast load times
- **🧭 Easy Navigation**: Intuitive navigation between pages

## Project Structure

```
RelaxVibe/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── MovieCard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── MovieDetail.jsx
│   │   └── Search.jsx
│   ├── styles/
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── Navbar.css
│   │   ├── Footer.css
│   │   ├── MovieCard.css
│   │   ├── Home.css
│   │   ├── MovieDetail.css
│   │   └── Search.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd RelaxVibe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Technologies Used

- **React 18.2.0** - UI library
- **Vite 5.0.0** - Build tool and dev server
- **React Router 6.18.0** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with custom properties

## Color Scheme

- Primary Color: `#ff9f1a` (Amber Orange)
- Secondary Color: `#221f1f` (Dark Gray)
- Background: `#0f0f0f` (Very Dark)
- Accent: `#ffe4c7` (Warm Cream)
- Text: `#ffffff` (White)

## Features to Implement

- [ ] Connect to a real movie API (TMDB, etc.)
- [ ] User authentication
- [ ] Watchlist functionality
- [ ] User ratings and reviews
- [ ] Video player integration
- [ ] Category filtering
- [ ] Advanced search filters
- [ ] User profile page
- [ ] Dark/Light theme toggle
- [ ] Social sharing features

## Current Data

The application currently uses mock data. To integrate with a real API:

1. Update the API endpoints in:
   - `src/pages/Home.jsx` - For movie listing
   - `src/pages/Search.jsx` - For search functionality
   - `src/pages/MovieDetail.jsx` - For detailed movie information

2. Replace the mock data with actual API calls using axios

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

This project is open source and available under the MIT License.

## Support

For support, email support@relaxvibe.com or open an issue in the repository.

---

**Enjoy your movie streaming experience with Relax Vibe! 🎬**
