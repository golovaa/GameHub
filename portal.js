// === Элементы DOM ===
const menuBtn = document.getElementById('menuBtn');
const settingsMenu = document.getElementById('settingsMenu');
const closeSettings = document.getElementById('closeSettings');

const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfile = document.getElementById('closeProfile');

const searchInput = document.getElementById('searchInput');
const googleSigninBtn = document.querySelector('.google-signin-btn');
const guestBtn = document.querySelector('.guest-btn');

// === Меню настроек ===
function openSettings() {
  settingsMenu.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSettingsMenu() {
  settingsMenu.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

menuBtn.addEventListener('click', openSettings);
closeSettings.addEventListener('click', closeSettingsMenu);

// Закрытие по клику на фон
settingsMenu.addEventListener('click', (e) => {
  if (e.target === settingsMenu) {
    closeSettingsMenu();
  }
});

// Закрытие по ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!settingsMenu.hasAttribute('hidden')) {
      closeSettingsMenu();
    }
    if (!profileModal.hasAttribute('hidden')) {
      closeProfileModal();
    }
  }
});

// === Модальное окно профиля ===
function openProfile() {
  if (currentUser) {
    // Если пользователь вошёл, показываем его профиль
    showUserProfile();
  } else {
    // Иначе показываем форму входа
    profileModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    // Убеждаемся, что обработчики кнопок активны
    setTimeout(() => initLoginButtons(), 100);
  }
}

function showUserProfile() {
  const t = translations[currentLang];
  const modalContent = profileModal.querySelector('.profile-body');
  
  // Сохраняем оригинальный контент
  if (!profileModal.dataset.originalContent) {
    profileModal.dataset.originalContent = modalContent.innerHTML;
  }
  
  // Показываем профиль пользователя
  const profileTitle = currentLang === 'ru' ? 'Профиль пользователя' : 'User Profile';
  const accountTypeLabel = currentLang === 'ru' ? 'Тип аккаунта' : 'Account type';
  const accountTypeValue = currentUser.type === 'guest' 
    ? (currentLang === 'ru' ? 'Гость' : 'Guest')
    : 'Google';
  const createdLabel = currentLang === 'ru' ? 'Создан' : 'Created';
  const logoutBtnText = currentLang === 'ru' ? 'Выйти' : 'Logout';
  
  document.querySelector('.profile-header h2').textContent = profileTitle;
  modalContent.innerHTML = `
    <div style="text-align: center; padding: 24px 0;">
      <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: rgba(90, 220, 130, 0.2); border-radius: 50%; display: grid; place-items: center;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <h3 style="font-size: 1.3rem; margin-bottom: 8px; color: #5ADC82;">${currentUser.username}</h3>
      <div style="margin: 16px 0; padding: 16px; background: rgba(90, 220, 130, 0.1); border-radius: 12px; text-align: left;">
        <p style="margin-bottom: 8px; color: rgba(230,248,238,0.7);"><strong>${accountTypeLabel}:</strong> ${accountTypeValue}</p>
        <p style="color: rgba(230,248,238,0.7);"><strong>${createdLabel}:</strong> ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
      </div>
      <button onclick="handleLogout()" style="width: 100%; height: 48px; background: rgba(220, 40, 52, 0.2); border: 1px solid rgba(220, 40, 52, 0.4); border-radius: 12px; color: #dc4034; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
        ${logoutBtnText}
      </button>
    </div>
  `;
  
  profileModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
  // Восстанавливаем оригинальный контент если был изменён
  if (profileModal.dataset.originalContent) {
    const modalContent = profileModal.querySelector('.profile-body');
    modalContent.innerHTML = profileModal.dataset.originalContent;
    
    const t = translations[currentLang];
    document.querySelector('.profile-header h2').textContent = t.profileTitle;
    
    // Очищаем флаг после восстановления
    delete profileModal.dataset.originalContent;
  }
  
  profileModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// Глобальная функция для выхода (вызывается из HTML)
window.handleLogout = function() {
  logout();
  
  // Восстанавливаем форму входа
  const modalContent = profileModal.querySelector('.profile-body');
  if (profileModal.dataset.originalContent) {
    modalContent.innerHTML = profileModal.dataset.originalContent;
    
    const t = translations[currentLang];
    document.querySelector('.profile-header h2').textContent = t.profileTitle;
    
    // Очищаем флаг
    delete profileModal.dataset.originalContent;
    
    // Переинициализируем обработчики кнопок
    initLoginButtons();
  }
  
  closeProfileModal();
  
  const t = translations[currentLang];
  const logoutMsg = currentLang === 'ru' 
    ? 'Вы вышли из аккаунта'
    : 'You have been logged out';
  setTimeout(() => alert(logoutMsg), 300);
}

profileBtn.addEventListener('click', openProfile);
closeProfile.addEventListener('click', closeProfileModal);

// Закрытие по клику на фон
profileModal.addEventListener('click', (e) => {
  if (e.target === profileModal) {
    closeProfileModal();
  }
});

// === Система пользователей ===
let currentUser = null;

// Загрузить пользователя из localStorage
function loadUser() {
  const userData = localStorage.getItem('gameHubUser');
  if (userData) {
    currentUser = JSON.parse(userData);
    updateUserUI();
  }
}

// Сохранить пользователя в localStorage
function saveUser(user) {
  currentUser = user;
  localStorage.setItem('gameHubUser', JSON.stringify(user));
  updateUserUI();
}

// Генерация случайного никнейма гостя
function generateGuestName() {
  const randomNum = Math.floor(Math.random() * 1000) + 1;
  return `guest${randomNum}`;
}

// Обновить UI для показа пользователя
function updateUserUI() {
  if (currentUser) {
    // Обновить кнопку профиля
    profileBtn.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span style="font-size: 0.9rem; font-weight: 500;">${currentUser.username}</span>
      </div>
    `;
    profileBtn.style.width = 'auto';
    profileBtn.style.padding = '0 16px';
  } else {
    // Вернуть исходный вид
    profileBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    `;
    profileBtn.style.width = '44px';
    profileBtn.style.padding = '';
  }
}

// Выход из аккаунта
function logout() {
  currentUser = null;
  localStorage.removeItem('gameHubUser');
  updateUserUI();
}

// Инициализация обработчиков для кнопок входа
function initLoginButtons() {
  const googleBtn = document.querySelector('.google-signin-btn');
  const guestButton = document.querySelector('.guest-btn');
  
  if (googleBtn) {
    // Удаляем старые обработчики (если есть)
    const newGoogleBtn = googleBtn.cloneNode(true);
    googleBtn.parentNode.replaceChild(newGoogleBtn, googleBtn);
    
    newGoogleBtn.addEventListener('click', () => {
      const t = translations[currentLang];
      alert(t.googleAlert);
      closeProfileModal();
    });
  }
  
  if (guestButton) {
    // Удаляем старые обработчики (если есть)
    const newGuestBtn = guestButton.cloneNode(true);
    guestButton.parentNode.replaceChild(newGuestBtn, guestButton);
    
    newGuestBtn.addEventListener('click', () => {
      const username = generateGuestName();
      const user = {
        username: username,
        type: 'guest',
        createdAt: new Date().toISOString()
      };
      
      saveUser(user);
      closeProfileModal();
      
      const t = translations[currentLang];
      const welcomeMsg = currentLang === 'ru' 
        ? `Добро пожаловать, ${username}!\n\nВаш прогресс будет сохранён локально.`
        : `Welcome, ${username}!\n\nYour progress will be saved locally.`;
      
      setTimeout(() => alert(welcomeMsg), 300);
    });
  }
}

// === Вход через Google (заглушка) ===
googleSigninBtn.addEventListener('click', () => {
  const t = translations[currentLang];
  alert(t.googleAlert);
  closeProfileModal();
});

// === Продолжить как гость ===
guestBtn.addEventListener('click', () => {
  const username = generateGuestName();
  const user = {
    username: username,
    type: 'guest',
    createdAt: new Date().toISOString()
  };
  
  saveUser(user);
  closeProfileModal();
  
  const t = translations[currentLang];
  const welcomeMsg = currentLang === 'ru' 
    ? `Добро пожаловать, ${username}!\n\nВаш прогресс будет сохранён локально.`
    : `Welcome, ${username}!\n\nYour progress will be saved locally.`;
  
  setTimeout(() => alert(welcomeMsg), 300);
});

// === Поиск игр ===
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const query = e.target.value.toLowerCase().trim();
  
  searchTimeout = setTimeout(() => {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
      const title = card.querySelector('.game-title')?.textContent.toLowerCase() || '';
      const description = card.querySelector('.game-description')?.textContent.toLowerCase() || '';
      
      if (title.includes(query) || description.includes(query)) {
        card.style.display = '';
        card.style.animation = 'fadeIn 0.3s ease';
      } else {
        card.style.display = 'none';
      }
    });
    
    // Проверка, если ничего не найдено
    const visibleCards = Array.from(gameCards).filter(card => card.style.display !== 'none');
    if (visibleCards.length === 0 && query) {
      showNoResults();
    } else {
      hideNoResults();
    }
  }, 300);
});

function showNoResults() {
  let noResults = document.querySelector('.no-results');
  if (!noResults) {
    const t = translations[currentLang];
    noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
      <div style="text-align: center; padding: 48px 24px; color: rgba(230,248,238,0.6);">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 16px; opacity: 0.4;">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <h3 style="font-size: 1.3rem; margin-bottom: 8px;">${t.noResultsTitle}</h3>
        <p>${t.noResultsText}</p>
      </div>
    `;
    document.querySelector('.games-grid').appendChild(noResults);
  }
}

function hideNoResults() {
  const noResults = document.querySelector('.no-results');
  if (noResults) {
    noResults.remove();
  }
}

// === Настройки ===
const themeSelect = document.getElementById('themeSelect');
const soundToggle = document.getElementById('soundToggle');
const notifToggle = document.getElementById('notifToggle');
const langSelect = document.getElementById('langSelect');

// === Словарь переводов ===
const translations = {
  ru: {
    // Хедер
    searchPlaceholder: 'Поиск игр...',
    
    // Меню настроек
    settingsTitle: 'Настройки',
    themeLabel: 'Тема оформления',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',
    themeAuto: 'Автоматически',
    soundLabel: 'Звуки',
    notificationsLabel: 'Уведомления',
    languageLabel: 'Язык',
    
    // Профиль
    profileTitle: 'Вход в аккаунт',
    profileSubtitle: 'Войдите, чтобы сохранять свой прогресс и достижения',
    googleSignIn: 'Войти через Google',
    guestButton: 'Продолжить как гость',
    dividerText: 'или',
    
    // Главная страница
    sectionTitle: 'Популярные игры',
    
    // Карточки игр
    snakeTitle: 'Змейка',
    snakeDescription: 'Классическая аркадная игра. Управляйте змейкой, собирайте яблоки и набирайте очки!',
    categoryArcade: '🎮 Аркада',
    rating: '⭐ 4.8',
    
    comingSoonTitle: 'Скоро',
    comingSoonDesc1: 'Новая увлекательная игра появится совсем скоро...',
    comingSoonDesc2: 'Следите за обновлениями!',
    categoryDevelopment: '🎯 В разработке',
    
    // Поиск
    noResultsTitle: 'Игры не найдены',
    noResultsText: 'Попробуйте изменить поисковый запрос',
    
    // Алерты
    googleAlert: 'Функция входа через Google будет реализована позже.\n\nДля этого потребуется:\n- Firebase Authentication\n- Google Cloud Console настройки\n- OAuth 2.0 конфигурация',
    guestAlert: 'Вы продолжаете как гость!\n\nПрогресс в играх будет сохраняться локально.'
  },
  en: {
    // Header
    searchPlaceholder: 'Search games...',
    
    // Settings menu
    settingsTitle: 'Settings',
    themeLabel: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeAuto: 'Auto',
    soundLabel: 'Sound',
    notificationsLabel: 'Notifications',
    languageLabel: 'Language',
    
    // Profile
    profileTitle: 'Sign In',
    profileSubtitle: 'Sign in to save your progress and achievements',
    googleSignIn: 'Sign in with Google',
    guestButton: 'Continue as Guest',
    dividerText: 'or',
    
    // Main page
    sectionTitle: 'Popular Games',
    
    // Game cards
    snakeTitle: 'Snake',
    snakeDescription: 'Classic arcade game. Control the snake, collect apples and earn points!',
    categoryArcade: '🎮 Arcade',
    rating: '⭐ 4.8',
    
    comingSoonTitle: 'Coming Soon',
    comingSoonDesc1: 'A new exciting game will appear very soon...',
    comingSoonDesc2: 'Stay tuned!',
    categoryDevelopment: '🎯 In Development',
    
    // Search
    noResultsTitle: 'No games found',
    noResultsText: 'Try changing your search query',
    
    // Alerts
    googleAlert: 'Google sign-in will be implemented later.\n\nRequired:\n- Firebase Authentication\n- Google Cloud Console setup\n- OAuth 2.0 configuration',
    guestAlert: 'You continue as a guest!\n\nGame progress will be saved locally.'
  }
};

// Текущий язык
let currentLang = 'ru';

// Функция смены языка
function changeLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  
  // Хедер
  searchInput.placeholder = t.searchPlaceholder;
  
  // Меню настроек
  document.querySelector('.settings-header h2').textContent = t.settingsTitle;
  document.querySelectorAll('.setting-item label')[0].firstChild.textContent = t.themeLabel;
  document.querySelector('#themeSelect option[value="dark"]').textContent = t.themeDark;
  document.querySelector('#themeSelect option[value="light"]').textContent = t.themeLight;
  document.querySelector('#themeSelect option[value="auto"]').textContent = t.themeAuto;
  document.querySelectorAll('.setting-item label span')[0].textContent = t.soundLabel;
  document.querySelectorAll('.setting-item label span')[1].textContent = t.notificationsLabel;
  document.querySelectorAll('.setting-item label')[3].firstChild.textContent = t.languageLabel;
  
  // Профиль
  document.querySelector('.profile-header h2').textContent = t.profileTitle;
  document.querySelector('.profile-subtitle').textContent = t.profileSubtitle;
  document.querySelector('.google-signin-btn').lastChild.textContent = ' ' + t.googleSignIn;
  document.querySelector('.divider span').textContent = t.dividerText;
  document.querySelector('.guest-btn').textContent = t.guestButton;
  
  // Главная страница
  document.querySelector('.section-title').textContent = t.sectionTitle;
  
  // Карточки игр
  const gameCards = document.querySelectorAll('.game-card');
  
  // Змейка
  if (gameCards[0]) {
    gameCards[0].querySelector('.game-title').textContent = t.snakeTitle;
    gameCards[0].querySelector('.game-description').textContent = t.snakeDescription;
    gameCards[0].querySelector('.game-category').textContent = t.categoryArcade;
    gameCards[0].querySelector('.game-rating').textContent = t.rating;
  }
  
  // Скоро 1
  if (gameCards[1]) {
    gameCards[1].querySelector('.game-title').textContent = t.comingSoonTitle;
    gameCards[1].querySelector('.game-description').textContent = t.comingSoonDesc1;
    gameCards[1].querySelector('.game-category').textContent = t.categoryDevelopment;
  }
  
  // Скоро 2
  if (gameCards[2]) {
    gameCards[2].querySelector('.game-title').textContent = t.comingSoonTitle;
    gameCards[2].querySelector('.game-description').textContent = t.comingSoonDesc2;
    gameCards[2].querySelector('.game-category').textContent = t.categoryDevelopment;
  }
  
  // Обновить "Игры не найдены" если оно отображается
  const noResults = document.querySelector('.no-results');
  if (noResults) {
    noResults.querySelector('h3').textContent = t.noResultsTitle;
    noResults.querySelector('p').textContent = t.noResultsText;
  }
}

// Загрузка сохранённых настроек
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('gameHubSettings') || '{}');
  
  if (settings.theme) {
    themeSelect.value = settings.theme;
    applyTheme(settings.theme);
  } else {
    // По умолчанию тёмная тема
    applyTheme('dark');
  }
  if (settings.sound !== undefined) soundToggle.checked = settings.sound;
  if (settings.notifications !== undefined) notifToggle.checked = settings.notifications;
  if (settings.language) {
    langSelect.value = settings.language;
    changeLanguage(settings.language);
  }
}

// Сохранение настроек
function saveSettings() {
  const settings = {
    theme: themeSelect.value,
    sound: soundToggle.checked,
    notifications: notifToggle.checked,
    language: langSelect.value
  };
  
  localStorage.setItem('gameHubSettings', JSON.stringify(settings));
}

// Функция смены темы
function applyTheme(theme) {
  const body = document.body;
  
  if (theme === 'light') {
    body.classList.add('light-theme');
  } else if (theme === 'dark') {
    body.classList.remove('light-theme');
  } else if (theme === 'auto') {
    // Определяем системную тему
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
    }
  }
}

// Обработчики изменений настроек
themeSelect.addEventListener('change', (e) => {
  applyTheme(e.target.value);
  saveSettings();
});
soundToggle.addEventListener('change', saveSettings);
notifToggle.addEventListener('change', saveSettings);
langSelect.addEventListener('change', (e) => {
  changeLanguage(e.target.value);
  saveSettings();
});

// Инициализация
loadSettings();
loadUser();

// === Анимация карточек при загрузке ===
document.addEventListener('DOMContentLoaded', () => {
  const gameCards = document.querySelectorAll('.game-card');
  
  gameCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * index);
  });
});

// === PWA установка ===
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Можно показать кнопку "Установить приложение"
  console.log('PWA можно установить');
});

window.addEventListener('appinstalled', () => {
  console.log('PWA установлено');
  deferredPrompt = null;
});

