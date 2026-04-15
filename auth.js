import { supabase } from './supabase.js';

/**
 * Check if the user is currently logged in.
 */
export async function checkUser() {
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Log in with email and password.
 */
export async function login(email, password) {
  if (!supabase) throw new Error('Supabase is not initialized.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

/**
 * Sign up with email and password only.
 * Profile data will be saved later in profile-settings.
 */
export async function signUp(email, password, extraData = {}) {
  if (!supabase) throw new Error('Supabase is not initialized.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/ranking.html`,
      data: {
        role: extraData.role || null,
        marketer_type: extraData.marketerType || null,
        industry: extraData.industry || null,
        full_name: extraData.fullName || null,
        english_name: extraData.englishName || null,
        nationality: extraData.nationality || null,
        languages: extraData.languages || null,
        phone: extraData.phone || null,
        contact_method: extraData.contactMethod || null,
        line_id: extraData.lineId || null,
        kakao_id: extraData.kakaoId || null,
        whatsapp: extraData.whatsapp || null,
        experience: extraData.experience || null
      }
    },
  });

  if (error) throw error;

  const user = data.user;
  if (!user) {
    throw new Error('회원가입은 성공했지만 사용자 정보를 가져오지 못했습니다.');
  }

  return user;
}

/**
 * Log out the current user.
 */
export async function logout() {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  window.location.reload();
}

/**
 * Initialize Auth UI (Login/Logout/Profile buttons) in the header.
 */
export function initAuthUI() {
  let container = document.getElementById('auth-ui-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'auth-ui-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    `;
    document.body.appendChild(container);
  }

  async function updateUI() {
    const user = await checkUser();
    container.innerHTML = '';

    if (user) {
      const profileBtn = document.createElement('a');
      profileBtn.href = 'profile-settings.html';
      profileBtn.textContent = '프로필 설정';
      profileBtn.className = 'btn';
      profileBtn.style.padding = '5px 12px';
      profileBtn.style.textDecoration = 'none';

      const userEmail = document.createElement('span');
      userEmail.textContent = user.email;
      userEmail.className = 'pill';
      userEmail.style.fontSize = '12px';
      userEmail.style.background = 'rgba(255,255,255,0.1)';

      const logoutBtn = document.createElement('button');
      logoutBtn.textContent = '로그아웃';
      logoutBtn.className = 'btn';
      logoutBtn.style.padding = '5px 12px';
      logoutBtn.onclick = logout;

      container.appendChild(profileBtn);
      container.appendChild(userEmail);
      container.appendChild(logoutBtn);
    } else {
      const loginBtn = document.createElement('a');
      loginBtn.href = 'login.html';
      loginBtn.textContent = '로그인 / 회원가입';
      loginBtn.className = 'upgrade-btn';
      loginBtn.style.padding = '8px 16px';
      loginBtn.style.fontSize = '13px';
      loginBtn.style.textDecoration = 'none';

      container.appendChild(loginBtn);
    }
  }

  updateUI();

  if (supabase) {
    supabase.auth.onAuthStateChange(() => {
      updateUI();
    });
  }
}

/**
 * Redirect to login page.
 */
export function showLoginModal() {
  window.location.href = 'login.html';
}
