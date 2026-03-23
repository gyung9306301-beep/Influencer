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

- **Supabase Authentication:** Integrated Supabase for user authentication (Login/Signup/Logout).
- **Protected Actions:** Clicking "선택 된 인플루언서 견적 확인" (Confirm Quote) on `ranking.html` now triggers a login popup if the user is not authenticated.
- **Persistent Header:** Added a login/logout button to the top right of all pages using `auth.js`.
- **Responsive Auth UI:** Simple modal for login and signup using vanilla JavaScript.

## Current State
- `index.html`: Main landing page with Auth UI initialization.
- `ranking.html`: The main ranking dashboard, protected with login check on the quote button.
- `quote.html` & `quote.js`: Protected page that displays a summary of selected influencers; also initializes Auth UI.
- `auth.js`: Centralized authentication logic and UI management.
- `supabase.js`: Supabase client initialization.
- `.env`: Stores Supabase project configuration.
- `style.css`: Visual styles, including new Auth UI styling.
- `main.js`: Updated to module script, handles data fetching, filtering, and login-protected navigation.

## Current Plan: Authentication Integration
- [x] Install `@supabase/supabase-js`.
- [x] Create `supabase.js` and `.env` for configuration.
- [x] Create `auth.js` for login/signup/logout and UI initialization.
- [x] Update `index.html`, `ranking.html`, and `quote.html` to include the Auth UI.
- [x] Protect the "Confirm Quote" button on `ranking.html` with a login check.

## Future Roadmap
- **Web Components:** Refactor the table and rows into custom elements.
- **Enhanced Data Visualization:** Add charts for data analysis.
- **PWA Support:** Enable offline viewing.
- **Firebase Hosting:** Deploy for global reach.
