# TikTok Influencer Ranking Dashboard

## Overview
A real-time dashboard that fetches and displays TikTok influencer rankings from a Google Sheet. It features searching, category filtering, pagination, and a premium data preview, all within a modern and responsive UI.

## Features & Implementation
- **Google Sheets Integration:** Fetches data via the `gviz` API for real-time updates.
- **Dynamic Filtering:** Supports keyword searches across all displayed columns and category-specific filtering based on Column C.
- **Dynamic Ranking:** Automatically re-calculates the rank (1, 2, 3...) based on the currently filtered and sorted results.
- **Influencer Selection:** Includes a "Select" column with checkboxes next to the "Link" column for selecting specific influencers.
- **Selection Counter:** Displays the total number of selected influencers in a real-time counter ("선택 된 인플루언서 총 0명") located near the pagination controls.
- **Selection Management:** Added "선택 초기화" (Reset Selection) and "선택 된 인플루언서 견적 확인" (Check Quote) buttons for bulk actions.
- **Quotation Page:** A new page (`quote.html`, `quote.js`) that displays a summary of selected influencers and calculates the total service fee based on influencer grades (Mega, Macro, Micro).
- **Service Fee Calculation:** Automatically calculates fees based on grade:
  - **Mega:** 3,000 KRW
  - **Macro:** 2,000 KRW
  - **Micro:** 1,000 KRW
- **Data Integrity:** Specifically excludes the 2nd row of the spreadsheet from the dashboard display to maintain data quality.
- **Responsive Design:** Utilizes modern CSS (Baseline) features including radial gradients, backdrop filters, and container-aware layouts.
- **Performance:** Implements client-side pagination (default 10 rows) and sorting.
- **Affiliate Application:** A centered footer link for affiliate applications using Formspree.

## Current State
- `index.html`: Main landing page or entry point (currently landing.html is used as the home).
- `ranking.html`: The main ranking dashboard, updated to link `main.js` and show "Quote Check Service" information.
- `quote.html` & `quote.js`: New quotation summary and fee calculation page.
- `style.css`: Contains all visual styles, using CSS variables for theming and modern layout techniques.
- `main.js`: Refactored to handle data fetching, filtering, sorting, and navigation to the quote page.

## Current Plan: Quotation Feature & Refinement
- [x] Refactor `main.js` for better structure and state management.
- [x] Implement `quote.html` and `quote.js` for quotation summaries.
- [x] Update `ranking.html` to reflect the "Quote Check Service" branding.
- [x] Integrate selection logic with the quotation page via `localStorage`.
- [x] Add fee calculation logic based on influencer grades.

## Future Roadmap
- **Web Components:** Refactor the table and rows into custom elements.
- **Enhanced Data Visualization:** Add charts for data analysis.
- **PWA Support:** Enable offline viewing.
- **Firebase Hosting:** Deploy for global reach.
