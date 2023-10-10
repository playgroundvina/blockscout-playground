import { isDarkMode } from './lib/dark_mode'
import Cookies from 'js-cookie'

function applyDarkMode() {
  if (isDarkMode()) {
    var isMobileVersion = document.getElementsByClassName('dark-theme-applied');
    if (isMobileVersion.length <= 0) {
      document.body.className += ' ' + 'dark-theme-applied'
      document.body.style.backgroundColor = '#242424'
    }
  }
  const darkModeChangerEl = document.getElementById('dark-mode-changer-switch')
  if (Cookies.get('chakra-ui-color-mode') === 'dark' && darkModeChangerEl) {
    darkModeChangerEl.checked = true;
  } else {
    darkModeChangerEl.checked = false;
    const modeChangerEl = document.getElementById('mode-changer-checked')
    if (modeChangerEl) {
      modeChangerEl.style.display = "none"
    }
    const modeChangerElNoChecked = document.getElementById('mode-changer-no-checked')
    if (modeChangerElNoChecked) {
      modeChangerElNoChecked.style.display = ""
    }
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
