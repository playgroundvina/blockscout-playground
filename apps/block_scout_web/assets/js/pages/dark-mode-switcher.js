import Cookies from 'js-cookie'

// @ts-ignore
const darkModeChangerEl = document.getElementById('dark-mode-changer-switch')

darkModeChangerEl && darkModeChangerEl.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    Cookies.set('chakra-ui-color-mode', 'dark')
  } else {
    Cookies.set('chakra-ui-color-mode', 'light')
  }
  document.location.reload()
})

const darkModeChangerElLight = document.getElementById('light-mode-changer-switch')

darkModeChangerElLight && darkModeChangerElLight.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    Cookies.set('chakra-ui-color-mode', 'dark')
  } else {
    Cookies.set('chakra-ui-color-mode', 'light')
  }
  document.location.reload()
})