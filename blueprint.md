# TikTok Influencer Ranking Dashboard

## Overview
A real-time dashboard that fetches and displays TikTok influencer rankings from a Google Sheet. It features searching, category filtering, pagination, and a premium data preview, all within a modern and responsive UI.

## Features & Implementation
- **Google Sheets Integration:** Fetches data via the `gviz` API for real-time updates.
- **Dynamic Filtering:** Supports keyword searches across all displayed columns and category-specific filtering based on Column C.
- **Dynamic Ranking:** Automatically re-calculates the rank (1, 2, 3...) based on the currently filtered and sorted results.
- **Influencer Selection:** Includes a "Select" column with checkboxes next to the "Link" column for selecting specific influencers.
- **Premium Access Preview:** Includes a preview mode for extended data (Columns G-J), which are:
  - **G:** 영상 평균 조회수 (Average Video Views)
  - **H:** 최고 영상 조회수 (Max Video Views)
  - **I:** 최소 영상 조회수 (Min Video Views)
  - **J:** 가격 (Price)
- **Data Integrity:** Specifically excludes the 2nd row of the spreadsheet from the dashboard display to maintain data quality.
- **Responsive Design:** Utilizes modern CSS (Baseline) features including radial gradients, backdrop filters, and container-aware layouts.
- **Performance:** Implements client-side pagination (default 20 rows) and sorting.
- **Affiliate Application:** A centered footer link for affiliate applications using Formspree.

## Current State
- `index.html`: Cleaned up structure, linking to external styles and scripts. Includes a premium banner, interactive table, and affiliate link in the footer.
- `style.css`: Contains all visual styles, using CSS variables for theming and modern layout techniques.
- `main.js`: Handles data fetching, filtering, sorting, and rendering logic. Includes the premium preview toggle.

## Current Plan: Refinement & Synchronization
- [x] Extract internal styles to `style.css`.
- [x] Extract internal logic to `main.js`.
- [x] Clean up `index.html` structure.
- [x] Implement dynamic ranking recalculation.
- [x] Add Premium Access Preview and UI improvements.
- [x] Rename premium columns and exclude spreadsheet row 2.
- [x] Add Affiliate Application link.
- [x] Remove the premium preview note from `ranking.html`.

## Future Roadmap
- **Web Components:** Refactor the table and rows into custom elements.
- **Enhanced Data Visualization:** Add charts for data analysis.
- **PWA Support:** Enable offline viewing.
- **Firebase Hosting:** Deploy for global reach.
