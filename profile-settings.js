import { supabase } from './supabase.js';
import { checkUser, showLoginModal, initAuthUI } from './auth.js';

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', async () => {
  initAuthUI();

  const roleBadge = $('roleBadge');
  const topMessage = $('topMessage');
  const emailBox = $('emailBox');
  const roleBox = $('roleBox');
  const industryBox = $('industryBox');
  const marketerTypeBox = $('marketerTypeBox');

  const pmProfileCard = $('pmProfileCard');
  const otherRoleCard = $('otherRoleCard');
  const pmProfileForm = $('pmProfileForm');

  const profileImageUrl = $('profileImageUrl');
  const displayName = $('displayName');
  const contactMethod = $('contactMethod');
  const availableHours = $('availableHours');
  const languages = $('languages');
  const specialties = $('specialties');
  const portfolioUrl = $('portfolioUrl');
  const introduction = $('introduction');

  const user = await checkUser();

  if (!user) {
    showLoginModal();
    return;
  }

  if (!supabase) {
    alert('Supabase 연결이 설정되지 않았습니다.');
    return;
  }

  emailBox.textContent = user.email || '-';

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      role,
      industry,
      marketer_type,
      profile_image_url,
      display_name,
      contact_method,
      available_hours,
      languages,
      specialties,
      portfolio_url,
      introduction
    `)
    .eq('id', user.id)
    .single();

  if (error) {
    console.error(error);
    topMessage.textContent = '프로필 정보를 불러오지 못했습니다.';
    roleBadge.textContent = '불러오기 실패';
    return;
  }

  const role = profile?.role || '';
  const industry = profile?.industry || '-';
  const marketerType = profile?.marketer_type || '-';

  roleBox.textContent = role || '-';
  industryBox.textContent = industry;
  marketerTypeBox.textContent = marketerType;
  roleBadge.textContent = role ? `현재 역할: ${role}` : '역할 미설정';

  if (role === 'project_manager') {
    pmProfileCard.classList.remove('hidden');
    otherRoleCard.classList.add('hidden');
    topMessage.textContent = '프로젝트 매니저 공개 프로필을 설정할 수 있습니다.';

    profileImageUrl.value = profile?.profile_image_url || '';
    displayName.value = profile?.display_name || '';
    contactMethod.value = profile?.contact_method || '';
    availableHours.value = profile?.available_hours || '';
    languages.value = profile?.languages || '';
    specialties.value = profile?.specialties || '';
    portfolioUrl.value = profile?.portfolio_url || '';
    introduction.value = profile?.introduction || '';
  } else {
    pmProfileCard.classList.add('hidden');
    otherRoleCard.classList.remove('hidden');
    topMessage.textContent = '현재 계정 역할에는 아직 별도 프로필 설정 화면이 준비되지 않았습니다.';
  }

  pmProfileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      profile_image_url: profileImageUrl.value.trim() || null,
      display_name: displayName.value.trim() || null,
      contact_method: contactMethod.value.trim() || null,
      available_hours: availableHours.value.trim() || null,
      languages: languages.value.trim() || null,
      specialties: specialties.value.trim() || null,
      portfolio_url: portfolioUrl.value.trim() || null,
      introduction: introduction.value.trim() || null
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id);

    if (updateError) {
      console.error(updateError);
      alert('저장에 실패했습니다. profiles 테이블 컬럼명을 다시 확인해주세요.');
      return;
    }

    alert('프로젝트 매니저 프로필이 저장되었습니다.');
  });
});
