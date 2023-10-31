import $ from 'jquery'

import { formatAllUsdValues, updateAllCalculatedUsdValues } from './lib/currency'
import { createCoinBalanceHistoryChart } from './lib/coin_balance_history_chart'

(async function () {
  const coinBalanceHistoryChartElement = $('[data-chart="coinBalanceHistoryChart"]')[0]
  if (coinBalanceHistoryChartElement) {
    // @ts-ignore
    window.coinBalanceHistoryChart = await createCoinBalanceHistoryChart(coinBalanceHistoryChartElement)
  }
  formatAllUsdValues()
  updateAllCalculatedUsdValues()
})()
