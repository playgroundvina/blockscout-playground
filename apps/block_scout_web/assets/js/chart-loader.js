import { formatAllUsdValues, updateAllCalculatedUsdValues } from './lib/currency'
import { createMarketHistoryChart, reloadDataChart } from './lib/history_chart'
import $ from 'jquery'


function renderHistoryChart() {
  const doashBoardPc = $(".dashboard-banner-pc");
  const isMobile = doashBoardPc.css('display') === "none"
  if (isMobile) {
    const dashboardChartElementMobile = document.querySelectorAll('[data-chart="historyChartMobile"]')
    if (dashboardChartElementMobile && !window.dashboardChartElementMobile) {
      // @ts-ignore
      window.dashboardChartElementMobile = createMarketHistoryChart(dashboardChartElementMobile[0])
    } else {
      reloadDataChart(dashboardChartElementMobile[0], window.dashboardChartElementMobile)
    }
  } else {
    const dashboardChartElement = document.querySelectorAll('[data-chart="historyChart"]')
    if (dashboardChartElement && !window.dashboardChart) {
      // @ts-ignore
      window.dashboardChart = createMarketHistoryChart(dashboardChartElement[0])
    } else {
      reloadDataChart(dashboardChartElement[0], window.dashboardChart)
    }
  }
  formatAllUsdValues()
  updateAllCalculatedUsdValues()
}


(function () {
  renderHistoryChart()
})()
