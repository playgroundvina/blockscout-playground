import { isDarkMode } from './lib/dark_mode'
import Cookies from 'js-cookie'

function applyDarkMode() {
  const darkModeChangerEl = document.getElementById('dark-mode-changer-switch')
  if (Cookies.get('chakra-ui-color-mode') === 'dark' && darkModeChangerEl) {
    darkModeChangerEl.checked = true;
  } else {
    darkModeChangerEl.checked = false;
  }
  setTimeout(() => {
    const modeChangerEl = document.getElementById('mode-changer')
    if (modeChangerEl) {
      modeChangerEl.style.visibility = "visible"
    }
  }, 1000);
  if (isDarkMode()) {
    document.body.className += ' ' + 'dark-theme-applied'
    document.body.style.backgroundColor = '#1c1d31'
  }
}
window.onload = applyDarkMode()

if (isDarkMode()) {
  if (document.getElementById('top-navbar')) {
    document.getElementById('top-navbar').style.backgroundColor = '#282945'
  }
  if (document.getElementById('navbar-logo')) {
    document.getElementById('navbar-logo').style.filter = 'brightness(0) invert(1)'
  }
  const modeChanger = document.getElementById('dark-mode-changer')
  if (modeChanger) {
    modeChanger.className += ' ' + 'dark-mode-changer--dark'
  }

  const modeChangerSun = document.getElementById('dark-mode-changer-sun')
  if (modeChangerSun) {
    modeChangerSun.className += ' ' + 'dark-mode-changer--dark'
  }


  const search = document.getElementById('main-search-autocomplete')
  const searchMobile = document.getElementById('main-search-autocomplete-mobile')
  if (search && search.style) {
    search.style.backgroundColor = '#22223a'
    search.style.borderColor = '#22223a'
  }
  if (searchMobile && searchMobile.style) {
    searchMobile.style.backgroundColor = '#22223a'
    searchMobile.style.borderColor = '#22223a'
  }
}
