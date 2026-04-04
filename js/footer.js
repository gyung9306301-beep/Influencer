// js/footer.js
document.addEventListener("DOMContentLoaded", function() {
    const footerHTML = `
    <footer style="padding: 40px 20px; border-top: 1px solid #eaeaea; margin-top: 50px; background-color: #fafafa; text-align: center; font-family: sans-serif;">
        <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 15px; flex-wrap: wrap;">
            <a href="/about.html" style="text-decoration: none; color: #555; font-size: 14px;">서비스 소개</a>
            <a href="/privacy.html" style="text-decoration: none; color: #555; font-size: 14px;">개인정보 처리방침</a>
            <a href="/terms.html" style="text-decoration: none; color: #555; font-size: 14px;">이용약관</a>
            <a href="/contact.html" style="text-decoration: none; color: #555; font-size: 14px;">문의하기</a>
        </div>
        <p style="color: #888; font-size: 12px; margin: 0;">
            © 2026 Influencer Marketing Platform. All rights reserved.
        </p>
    </footer>
    `;

    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
        footerContainer.innerHTML = footerHTML;
    }
});
