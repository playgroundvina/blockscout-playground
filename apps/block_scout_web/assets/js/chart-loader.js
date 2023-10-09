import { formatAllUsdValues, updateAllCalculatedUsdValues } from './lib/currency'
import { createMarketHistoryChart } from './lib/history_chart'
import $ from 'jquery'

(function () {
  const doashBoardPc = $(".dashboard-banner-pc");
  const isMobile = doashBoardPc.css('display') === "none"
  if (isMobile) {
    const dashboardChartElementMobile = document.querySelectorAll('[data-chart="historyChartMobile"]')
    if (dashboardChartElementMobile) {
      // @ts-ignore
      window.dashboardChartElementMobile = createMarketHistoryChart(dashboardChartElementMobile[0])
    }
  } else {
    const dashboardChartElement = document.querySelectorAll('[data-chart="historyChart"]')
    if (dashboardChartElement) {
      // @ts-ignore
      window.dashboardChart = createMarketHistoryChart(dashboardChartElement[0])
    }
  }
  formatAllUsdValues()
  updateAllCalculatedUsdValues()
})()
