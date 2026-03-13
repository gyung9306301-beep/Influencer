# TikTok Influencer Ranking Dashboard

## Overview
A real-time dashboard that fetches and displays TikTok influencer rankings from a Google Sheet. It features searching, category filtering (Column C), and pagination, with a modern and responsive UI.

## Features & Implementation
- **Google Sheets Integration:** Fetches data via the `gviz` API for real-time updates.
- **Dynamic Filtering:** Supports keyword searches across multiple columns and category-specific filtering based on Column C.
- **Responsive Design:** Utilizes modern CSS (Baseline) features including radial gradients, backdrop filters, and container-aware layouts.
- **Performance:** Implements client-side pagination and sorting to handle large datasets efficiently.

## Current Plan: Project Setup & Refactoring
- [x] Extract internal styles to `style.css`.
- [x] Extract internal logic to `main.js`.
- [x] Clean up `index.html` structure.
- [x] Set up `package.json` for development scripts.
- [x] Configure `.idx/dev.nix` for the new dev environment.

## Future Roadmap
- **Enhanced Data Visualization:** Add charts to visualize influencer growth or category distribution.
- **PWA Support:** Enable offline viewing and app-like experience on mobile.
- **Firebase Hosting:** Deploy the dashboard using Firebase for better performance and global reach.
