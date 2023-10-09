import { formatAllUsdValues, updateAllCalculatedUsdValues } from './lib/currency'
import { createMarketHistoryChart } from './lib/history_chart'

(function () {
  const dashboardChartElement = document.querySelectorAll('[data-chart="historyChart"]')
  if (dashboardChartElement) {
    // @ts-ignore
    window.dashboardChart = createMarketHistoryChart(dashboardChartElement[0])
    if (dashboardChartElement.length > 1) {
      window.dashboardChart = createMarketHistoryChart(dashboardChartElement[1])
    }
  }
  formatAllUsdValues()
  updateAllCalculatedUsdValues()
})()
