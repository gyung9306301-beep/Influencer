import { supabase } from './supabase.js';

export async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.reload();
}

export function initAuthUI() {
  const container = document.createElement('div');
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

  async function updateUI() {
    const user = await checkUser();
    container.innerHTML = '';
    
    if (user) {
      const userEmail = document.createElement('span');
      userEmail.textContent = user.email;
      userEmail.style.fontSize = '14px';
      userEmail.style.color = 'var(--muted)';
      
      const logoutBtn = document.createElement('button');
      logoutBtn.textContent = '로그아웃';
      logoutBtn.className = 'btn';
      logoutBtn.style.padding = '5px 10px';
      logoutBtn.onclick = logout;
      
      container.appendChild(userEmail);
      container.appendChild(logoutBtn);
    } else {
      const loginBtn = document.createElement('button');
      loginBtn.textContent = '로그인';
      loginBtn.className = 'btn';
      loginBtn.style.padding = '5px 10px';
      loginBtn.onclick = showLoginModal;
      container.appendChild(loginBtn);
    }
  }

  updateUI();

  // Listen for auth changes
  supabase.auth.onAuthStateChange(() => {
    updateUI();
  });
}

export function showLoginModal() {
  // Simple modal implementation
  const modal = document.createElement('div');
  modal.id = 'login-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  const modalContent = document.createElement('div');
  modalContent.className = 'panel';
  modalContent.style.cssText = `
    width: min(400px, 90%);
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  `;

  modalContent.innerHTML = `
    <h2 style="margin-top:0">로그인</h2>
    <div class="field">
      <label>Email</label>
      <input type="email" id="login-email" class="input" placeholder="example@email.com">
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" id="login-password" class="input" placeholder="********">
    </div>
    <div id="login-error" style="color:#ff5f5f; font-size:14px; min-height:18px;"></div>
    <div style="display:flex; gap:10px; justify-content: flex-end; margin-top:10px;">
      <button id="cancel-login" class="btn">취소</button>
      <button id="submit-login" class="upgrade-btn">로그인</button>
    </div>
    <div style="margin-top:15px; font-size:14px; text-align:center;">
      계정이 없으신가요? <a href="#" id="go-to-signup" style="color:var(--cyan)">회원가입</a>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  const emailInput = modal.querySelector('#login-email');
  const passwordInput = modal.querySelector('#login-password');
  const errorDiv = modal.querySelector('#login-error');

  modal.querySelector('#cancel-login').onclick = () => modal.remove();

  modal.querySelector('#submit-login').onclick = async () => {
    try {
      await login(emailInput.value, passwordInput.value);
      modal.remove();
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  };

  modal.querySelector('#go-to-signup').onclick = (e) => {
    e.preventDefault();
    showSignupModal();
    modal.remove();
  };
}

export function showSignupModal() {
  const modal = document.createElement('div');
  modal.id = 'signup-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  const modalContent = document.createElement('div');
  modalContent.className = 'panel';
  modalContent.style.cssText = `
    width: min(400px, 90%);
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  `;

  modalContent.innerHTML = `
    <h2 style="margin-top:0">회원가입</h2>
    <div class="field">
      <label>Email</label>
      <input type="email" id="signup-email" class="input" placeholder="example@email.com">
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" id="signup-password" class="input" placeholder="********">
    </div>
    <div id="signup-error" style="color:#ff5f5f; font-size:14px; min-height:18px;"></div>
    <div style="display:flex; gap:10px; justify-content: flex-end; margin-top:10px;">
      <button id="cancel-signup" class="btn">취소</button>
      <button id="submit-signup" class="upgrade-btn">가입하기</button>
    </div>
    <div style="margin-top:15px; font-size:14px; text-align:center;">
      이미 계정이 있으신가요? <a href="#" id="go-to-login" style="color:var(--cyan)">로그인</a>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  const emailInput = modal.querySelector('#signup-email');
  const passwordInput = modal.querySelector('#signup-password');
  const errorDiv = modal.querySelector('#signup-error');

  modal.querySelector('#cancel-signup').onclick = () => modal.remove();

  modal.querySelector('#submit-signup').onclick = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email: emailInput.value,
        password: passwordInput.value,
      });
      if (error) throw error;
      alert('회원가입 성공! 이메일을 확인해 주세요.');
      modal.remove();
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  };

  modal.querySelector('#go-to-login').onclick = (e) => {
    e.preventDefault();
    showLoginModal();
    modal.remove();
  };
}
