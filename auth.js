import { supabase } from './supabase.js';

/**
 * Check if the user is currently logged in.
 */
export async function checkUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
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
  return data;
}

/**
 * Sign up with email and password.
 */
import { supabase } from './supabase.js';

export async function signUp(email, password, extraData = {}) {
  // 1. 회원가입
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;

  const user = data.user;

  if (!user) {
    throw new Error('회원가입 실패');
  }

  // 2. profiles 테이블 저장
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: email,
        role: extraData.role || null,
        marketer_type: extraData.marketerType || null,
        industry: extraData.industry || null
      }
    ]);

  if (profileError) {
    console.error('profiles 저장 실패:', profileError);
    throw profileError;
  }

  return user;
}
    if (!supabase) throw new Error('Supabase is not initialized.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/ranking.html'
      }
    });
    if (error) throw error;
    return data;
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
 * Initialize Auth UI (Login/Logout buttons) in the header.
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
    `;
    document.body.appendChild(container);
  }

  async function updateUI() {
    const user = await checkUser();
    container.innerHTML = '';
    
    if (user) {
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
 * Show login modal (legacy support or fallback).
 * Now redirects to login.html instead of showing a modal.
 */
export function showLoginModal() {
  window.location.href = 'login.html';
}
