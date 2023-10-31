import Cookies from 'js-cookie'
import { getAxisFontColor } from '../../../../block_scout_web/assets/js/lib/history_chart'
import $ from 'jquery'

function reRenderChart() {
  const newColorAxis = getAxisFontColor()

  window.dashboardChartElementMobile.chart.options.scales.x.ticks.color = newColorAxis
  window.dashboardChartElementMobile.chart.options.scales.price.ticks.color = newColorAxis
  window.dashboardChartElementMobile.chart.options.scales.marketCap.ticks.color = newColorAxis
  window.dashboardChartElementMobile.chart.options.scales.numTransactions.ticks.color = newColorAxis
  window.dashboardChartElementMobile.chart.update()
  
  window.dashboardChart.chart.options.scales.x.ticks.color = newColorAxis
  window.dashboardChart.chart.options.scales.price.ticks.color = newColorAxis
  window.dashboardChart.chart.options.scales.marketCap.ticks.color = newColorAxis
  window.dashboardChart.chart.options.scales.numTransactions.ticks.color = newColorAxis
  window.dashboardChart.chart.update()
}

// @ts-ignore
const darkModeChangerEl = document.getElementById('dark-mode-changer-switch')

darkModeChangerEl && darkModeChangerEl.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    var isMobileVersion = document.getElementsByClassName('dark-theme-applied');
    if (isMobileVersion.length <= 0) {
      document.body.className += ' ' + 'dark-theme-applied'
      document.body.style.backgroundColor = '#242424'
    }
    Cookies.set('chakra-ui-color-mode', 'dark')
  } else {
    var isMobileVersion = document.getElementsByClassName('dark-theme-applied');
    if (isMobileVersion.length > 0) {
      document.body.classList.remove("dark-theme-applied");
      document.body.style.backgroundColor = '#efefef'

    }
    Cookies.set('chakra-ui-color-mode', 'light')
  }
  reRenderChart()
  // document.location.reload()
})