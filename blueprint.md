# TikTok Influencer Ranking Dashboard

## Overview
A real-time dashboard that fetches and displays TikTok influencer rankings from a Google Sheet. It features searching, category filtering (Column C), and pagination, with a modern and responsive UI.

## Features & Implementation
- **Google Sheets Integration:** Fetches data via the `gviz` API for real-time updates.
- **Dynamic Filtering:** Supports keyword searches across multiple columns (A, B, D, E) and category-specific filtering based on Column C.
- **Dynamic Ranking:** Automatically re-calculates the rank (1, 2, 3...) based on the currently filtered and sorted results, ensuring a fresh ranking for any view.
- **Responsive Design:** Utilizes modern CSS (Baseline) features including radial gradients, backdrop filters, and container-aware layouts.
- **Performance:** Implements client-side pagination and sorting to handle large datasets efficiently.
- **Interactive UI:** Includes a live refresh button, page size selection, and sorting by column headers.

## Current State
- `index.html`: Cleaned up structure, linking to external styles and scripts. Includes a dashboard header with an "eyebrow" and a toolbar for filtering.
- `style.css`: Contains all visual styles, using CSS variables for theming and modern layout techniques like CSS Grid and Flexbox.
- `main.js`: Handles data fetching, filtering, sorting, and rendering logic. Uses `fetch` and the `gviz` API.

## Current Plan: Refinement & Synchronization
- [x] Extract internal styles to `style.css`.
- [x] Extract internal logic to `main.js`.
- [x] Clean up `index.html` structure.
- [x] Synchronize files with the latest single-file version provided by the user.
- [x] Add Refresh button and Page Size selection logic.

## Future Roadmap
- **Web Components:** Refactor the table and rows into custom elements for better encapsulation.
- **Enhanced Data Visualization:** Add charts to visualize influencer growth or category distribution.
- **PWA Support:** Enable offline viewing and app-like experience on mobile.
- **Firebase Hosting:** Deploy the dashboard using Firebase for better performance and global reach.
