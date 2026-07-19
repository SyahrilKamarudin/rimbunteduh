(function () {
  function getDict() {
    var el = document.getElementById('i18n-data');
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      return null;
    }
  }

  function getPath(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
  }

  function applyLang(lang) {
    var dict = getDict();
    if (!dict) return;
    var t = dict[lang] || dict.en;
    document.documentElement.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var key = node.getAttribute('data-i18n');
      var value = getPath(t, key);
      if (typeof value === 'string') node.textContent = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-placeholder');
      var value = getPath(t, key);
      if (typeof value === 'string') node.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('bg-forest', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('text-[#3d4a37]', !isActive);
    });

    window.dispatchEvent(new CustomEvent('rt-lang-change', { detail: { lang: lang } }));
  }

  function currentLang() {
    try {
      return localStorage.getItem('rt_lang') || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function setLang(lang) {
    try {
      localStorage.setItem('rt_lang', lang);
    } catch (e) {}
    applyLang(lang);
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyLang(currentLang());
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang-btn'));
      });
    });
  });

  window.__rtSetLang = setLang;
  window.__rtCurrentLang = currentLang;
})();
