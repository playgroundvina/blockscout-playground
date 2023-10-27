import $ from 'jquery'
import omit from 'lodash.omit'
import first from 'lodash.first'
import rangeRight from 'lodash.rangeright'
import find from 'lodash.find'
import map from 'lodash.map'
import humps from 'humps'
import numeral from 'numeral'
import socket from '../socket'
import { updateAllCalculatedUsdValues, formatUsdValue } from '../lib/currency'
import { createStore, connectElements } from '../lib/redux_helpers.js'
import { batchChannel, showLoader } from '../lib/utils'
import listMorph from '../lib/list_morph'
import '../app'
import { openErrorModal, openSuccessModal, openWarningModal } from '../lib/modals'
import { createMarketHistoryChart } from '../lib/history_chart'

const BATCH_THRESHOLD = 6
const BLOCKS_PER_PAGE = 4

export const initialState = {
  addressCount: null,
  availableSupply: null,
  averageBlockTime: null,
  marketHistoryData: null,
  blocks: [],
  blocksLoading: true,
  blocksError: false,
  transactions: [],
  transactionsBatch: [],
  transactionsError: false,
  transactionsLoading: true,
  transactionCount: null,
  totalGasUsageCount: null,
  usdMarketCap: null,
  blockCount: null
}

export const reducer = withMissingBlocks(baseReducer)

function baseReducer(state = initialState, action) {
  switch (action.type) {
    case 'ELEMENTS_LOAD': {
      return Object.assign({}, state, omit(action, 'type'))
    }
    case 'RECEIVED_NEW_ADDRESS_COUNT': {
      return Object.assign({}, state, {
        addressCount: action.msg.count
      })
    }
    case 'RECEIVED_NEW_BLOCK': {
      const firstBlock = ($('#indexer-first-block').text() && parseInt($('#indexer-first-block').text(), 10)) || 0
      const blockCount = (action.msg.blockNumber - firstBlock) + 1
      // @ts-ignore
      if (!state.blocks.length || state.blocks[0].blockNumber < action.msg.blockNumber) {
        let pastBlocks
        if (state.blocks.length < BLOCKS_PER_PAGE) {
          pastBlocks = state.blocks
        } else {
          $('.miner-address-tooltip').tooltip('hide')
          pastBlocks = state.blocks.slice(0, -1)
        }
        return Object.assign({}, state, {
          averageBlockTime: action.msg.averageBlockTime,
          blocks: [
            action.msg,
            ...pastBlocks
          ],
          blockCount
        })
      } else {
        return Object.assign({}, state, {
          // @ts-ignore
          blocks: state.blocks.map((block) => block.blockNumber === action.msg.blockNumber ? action.msg : block),
          blockCount
        })
      }
    }
    case 'START_BLOCKS_FETCH': {
      return Object.assign({}, state, { blocksError: false, blocksLoading: true })
    }
    case 'BLOCKS_FINISH_REQUEST': {
      return Object.assign({}, state, { blocksLoading: false })
    }
    case 'BLOCKS_FETCHED': {
      return Object.assign({}, state, { blocks: [...action.msg.blocks], blocksLoading: false })
    }
    case 'BLOCKS_REQUEST_ERROR': {
      return Object.assign({}, state, { blocksError: true, blocksLoading: false })
    }
    case 'RECEIVED_NEW_EXCHANGE_RATE': {
      return Object.assign({}, state, {
        availableSupply: action.msg.exchangeRate.availableSupply,
        marketHistoryData: action.msg.marketHistoryData,
        usdMarketCap: action.msg.exchangeRate.marketCapUsd
      })
    }
    case 'RECEIVED_NEW_TRANSACTION_BATCH': {
      if (state.channelDisconnected) return state

      const transactionCount = state.transactionCount + action.msgs.length

      if (state.transactionsLoading || state.transactionsError) {
        return Object.assign({}, state, { transactionCount })
      }

      const transactionsLength = state.transactions.length + action.msgs.length
      if (transactionsLength < BATCH_THRESHOLD) {
        return Object.assign({}, state, {
          transactions: [
            ...action.msgs.reverse(),
            ...state.transactions
          ],
          transactionCount
        })
      } else if (!state.transactionsBatch.length && action.msgs.length < BATCH_THRESHOLD) {
        return Object.assign({}, state, {
          transactions: [
            ...action.msgs.reverse(),
            ...state.transactions.slice(0, -1 * action.msgs.length)
          ],
          transactionCount
        })
      } else {
        return Object.assign({}, state, {
          transactionsBatch: [
            ...action.msgs.reverse(),
            ...state.transactionsBatch
          ],
          transactionCount
        })
      }
    }
    case 'TRANSACTION_BATCH_EXPANDED': {
      return Object.assign({}, state, {
        transactionsBatch: []
      })
    }
    case 'RECEIVED_UPDATED_TRANSACTION_STATS': {
      return Object.assign({}, state, {
        transactionStats: action.msg.stats
      })
    }
    case 'START_TRANSACTIONS_FETCH':
      return Object.assign({}, state, { transactionsError: false, transactionsLoading: true })
    case 'TRANSACTIONS_FETCHED':
      return Object.assign({}, state, { transactions: [...action.msg.transactions] })
    case 'TRANSACTIONS_FETCH_ERROR':
      return Object.assign({}, state, { transactionsError: true })
    case 'FINISH_TRANSACTIONS_FETCH':
      return Object.assign({}, state, { transactionsLoading: false })
    default:
      return state
  }
}

function withMissingBlocks(reducer) {
  return (...args) => {
    const result = reducer(...args)

    if (!result.blocks || result.blocks.length < 2) return result

    const maxBlock = first(result.blocks).blockNumber
    const minBlock = maxBlock - (result.blocks.length - 1)

    return Object.assign({}, result, {
      blocks: rangeRight(minBlock, maxBlock + 1)
        .map((blockNumber) => find(result.blocks, ['blockNumber', blockNumber]) || {
          blockNumber,
          chainBlockHtml: placeHolderBlock(blockNumber)
        })
    })
  }
}

let chart
let chartMobile
const elements = {
  '[data-chart="historyChart"]': {
    load() {
      // @ts-ignore
      chart = window.dashboardChart
      if (!chart) {
        const dashboardChartElement = document.querySelectorAll('[data-chart="historyChart"]')
        if (dashboardChartElement) {
          // @ts-ignore
          chart = window.dashboardChart = createMarketHistoryChart(dashboardChartElement[0])
        }
      }
    },
    render(_$el, state, oldState) {
      const doashBoardPc = $(".dashboard-banner-pc");
      const isMobile = doashBoardPc.css('display') === "none"
      if (isMobile) return
      if (!chart || (oldState.availableSupply === state.availableSupply && oldState.marketHistoryData === state.marketHistoryData) || !state.availableSupply) return

      chart.updateMarketHistory(state.availableSupply, state.marketHistoryData)

      if (!chart || (JSON.stringify(oldState.transactionStats) === JSON.stringify(state.transactionStats))) return

      chart.updateTransactionHistory(state.transactionStats)
    }
  },
  '[data-chart="historyChartMobile"]': {
    load() {
      // @ts-ignore
      chartMobile = window.dashboardChartMobile
      if (!chartMobile) {
        const dashboardChartElementMobile = document.querySelectorAll('[data-chart="historyChartMobile"]')
        if (dashboardChartElementMobile) {
          // @ts-ignore
          chartMobile = window.dashboardChartElementMobile = createMarketHistoryChart(dashboardChartElementMobile[0])
        }
      }
    },
    render(_$el, state, oldState) {
      const doashBoardPc = $(".dashboard-banner-pc");
      const isMobile = doashBoardPc.css('display') === "none"
      if (!isMobile) return
      if (!chartMobile || (oldState.availableSupply === state.availableSupply && oldState.marketHistoryData === state.marketHistoryData) || !state.availableSupply) return

      chartMobile.updateMarketHistory(state.availableSupply, state.marketHistoryData)

      if (!chartMobile || (JSON.stringify(oldState.transactionStats) === JSON.stringify(state.transactionStats))) return

      chartMobile.updateTransactionHistory(state.transactionStats)
    }
  },
  '[data-selector="transaction-count"]': {
    load($el) {
      return { transactionCount: numeral($el.text()).value() }
    },
    render($el, state, oldState) {
      if (oldState.transactionCount === state.transactionCount) return
      $el.empty().append(numeral(state.transactionCount).format())
    }
  },
  '[data-selector="transaction-count-mobile"]': {
    load($el) {
      return { transactionCount: numeral($el.text()).value() }
    },
    render($el, state, oldState) {
      if (oldState.transactionCount === state.transactionCount) return
      $el.empty().append(numeral(state.transactionCount).format())
    }
  },
  '[data-selector="total-gas-usage"]': {
    load($el) {
      return { totalGasUsageCount: numeral($el.text()).value() }
    },
    render($el, state, oldState) {
      if (oldState.totalGasUsageCount === state.totalGasUsageCount) return
      $el.empty().append(numeral(state.totalGasUsageCount).format())
    }
  },
  '[data-selector="block-count"]': {
    load($el) {
      return { blockCount: numeral($el.text()).value() }
    },
    render($el, state, oldState) {
      if (oldState.blockCount === state.blockCount) return
      $el.empty().append(numeral(state.blockCount).format())
    }
  },
  '[data-selector="block-count-mobile"]': {
    load($el) {
      return { blockCount: numeral($el.text()).value() }
    },
    render($el, state, oldState) {
      if (oldState.blockCount === state.blockCount) return
      $el.empty().append(numeral(state.blockCount).format())
    }
  },
  '[data-selector="address-count"]': {
    render($el, state, oldState) {
      if (oldState.addressCount === state.addressCount) return
      $el.empty().append(state.addressCount)
    }
  },
  '[data-selector="average-block-time"]': {
    render($el, state, oldState) {
      if (oldState.averageBlockTime === state.averageBlockTime) return
      $el.empty().append(state.averageBlockTime)
    }
  },
  '[data-selector="market-cap"]': {
    render($el, state, oldState) {
      if (oldState.usdMarketCap === state.usdMarketCap) return
      $el.empty().append(formatUsdValue(state.usdMarketCap))
    }
  },
  '[data-selector="tx_per_day"]': {
    render($el, state, oldState) {
      if (!(JSON.stringify(oldState.transactionStats) === JSON.stringify(state.transactionStats))) {
        $el.empty().append(numeral(state.transactionStats[0].number_of_transactions).format('0,0'))
      }
    }
  },
  '[data-selector="chain-block-list"]': {
    load($el) {
      return {
        blocksPath: $el[0].dataset.url
      }
    },
    render($el, state, oldState) {
      if (oldState.blocks === state.blocks) return

      const container = $el[0]

      if (state.blocksLoading === false) {
        const blocks = map(state.blocks, ({ chainBlockHtml }) => $(chainBlockHtml)[0])
        listMorph(container, blocks, { key: 'dataset.blockNumber', horizontal: true })
      }
    }
  },
  '[data-selector="chain-block-list"] [data-selector="error-message"]': {
    render($el, state, _oldState) {
      if (state.blocksError) {
        $el.show()
      } else {
        $el.hide()
      }
    }
  },
  '[data-selector="chain-block-list"] [data-selector="loading-message"]': {
    render($el, state, _oldState) {
      showLoader(state.blocksLoading, $el)
    }
  },
  '[data-selector="transactions-list"] [data-selector="error-message"]': {
    render($el, state, _oldState) {
      $el.toggle(state.transactionsError)
    }
  },
  // '[data-selector="transactions-list"] [data-selector="loading-message"]': {
  //   render($el, state, _oldState) {
  //     showLoader(state.transactionsLoading, $el)
  //   }
  // },
  '[data-selector="transactions-list"]': {
    load($el) {
      return { transactionsPath: $el[0].dataset.transactionsPath }
    },
    render($el, state, oldState) {
      if (oldState.transactions === state.transactions) return
      const container = $el[0]
      const newElements = map(state.transactions, ({ transactionHtml, transactionChainHtml }) => {
        if (transactionChainHtml) return $(transactionChainHtml)[0]
        return $(transactionHtml)[0]
      })
      listMorph(container, newElements, { key: 'dataset.identifierHash', horizontal: null })
    }
  },
  '[data-selector="channel-batching-count"]': {
    render($el, state, _oldState) {
      const $channelBatching = $('[data-selector="channel-batching-message"]')
      if (!state.transactionsBatch.length) return $channelBatching.hide()
      $channelBatching.show()
      $el[0].innerHTML = numeral(state.transactionsBatch.length).format()
    }
  }
}

const $chainDetailsPage = $('[data-page="chain-details"]')
if ($chainDetailsPage.length) {
  const store = createStore(reducer)
  connectElements({ store, elements })

  loadTransactions(store)
  bindTransactionErrorMessage(store)

  loadBlocks(store)
  bindBlockErrorMessage(store)

  const exchangeRateChannel = socket.channel('exchange_rate:new_rate')
  exchangeRateChannel.join()
  exchangeRateChannel.on('new_rate', (msg) => {
    updateAllCalculatedUsdValues(humps.camelizeKeys(msg).exchangeRate.usdValue)
    store.dispatch({
      type: 'RECEIVED_NEW_EXCHANGE_RATE',
      msg: humps.camelizeKeys(msg)
    })
  })

  const addressesChannel = socket.channel('addresses:new_address')
  addressesChannel.join()
  addressesChannel.on('count', msg => store.dispatch({
    type: 'RECEIVED_NEW_ADDRESS_COUNT',
    msg: humps.camelizeKeys(msg)
  }))

  const blocksChannel = socket.channel('blocks:new_block')
  blocksChannel.join()
  blocksChannel.on('new_block', msg => store.dispatch({
    type: 'RECEIVED_NEW_BLOCK',
    msg: humps.camelizeKeys(msg)
  }))

  const transactionsChannel = socket.channel('transactions:new_transaction')
  transactionsChannel.join()
  transactionsChannel.on('transaction', batchChannel((msgs) => store.dispatch({
    type: 'RECEIVED_NEW_TRANSACTION_BATCH',
    msgs: humps.camelizeKeys(msgs)
  })))

  const transactionStatsChannel = socket.channel('transactions:stats')
  transactionStatsChannel.join()
  transactionStatsChannel.on('update', msg => store.dispatch({
    type: 'RECEIVED_UPDATED_TRANSACTION_STATS',
    msg
  }))

  const $txReloadButton = $('[data-selector="reload-transactions-button"]')
  const $channelBatching = $('[data-selector="channel-batching-message"]')
  $txReloadButton.on('click', (event) => {
    event.preventDefault()
    loadTransactions(store)
    $channelBatching.hide()
    store.dispatch({
      type: 'TRANSACTION_BATCH_EXPANDED'
    })
  })
}

function loadTransactions(store) {
  const path = store.getState().transactionsPath
  store.dispatch({ type: 'START_TRANSACTIONS_FETCH' })
  $.getJSON(path)
    .done(response => store.dispatch({ type: 'TRANSACTIONS_FETCHED', msg: humps.camelizeKeys(response) }))
    .fail(() => store.dispatch({ type: 'TRANSACTIONS_FETCH_ERROR' }))
    .always(() => store.dispatch({ type: 'FINISH_TRANSACTIONS_FETCH' }))
}

function bindTransactionErrorMessage(store) {
  $('[data-selector="transactions-list"] [data-selector="error-message"]').on('click', _event => loadTransactions(store))
}

export function placeHolderBlock(blockNumber) {
  return `
    <div
      class="col-12 mb-3 d-flex fade-up-blocks-chain"
      data-block-number="${blockNumber}"
      data-selector="place-holder"
    >
      <div class="tile tile-type-block n-p w-100 row">
        <div class="col-3 col-lg-2">
          <div class="icon-block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 7.35321V16.6472C21.0001 16.7543 20.9714 16.8595 20.9171 16.9518C20.8627 17.0442 20.7847 17.1203 20.691 17.1722L12.291 21.8382C12.202 21.8876 12.1018 21.9135 12 21.9135C11.8982 21.9135 11.798 21.8876 11.709 21.8382L3.309 17.1722C3.21532 17.1203 3.13725 17.0442 3.08292 16.9518C3.02858 16.8595 2.99995 16.7543 3 16.6472V7.35321C3.00013 7.24625 3.02884 7.14127 3.08317 7.04914C3.1375 6.95701 3.21547 6.88108 3.309 6.82921L11.709 2.16221C11.798 2.11282 11.8982 2.08691 12 2.08691C12.1018 2.08691 12.202 2.11282 12.291 2.16221L20.691 6.82921C20.7845 6.88108 20.8625 6.95701 20.9168 7.04914C20.9712 7.14127 20.9999 7.24625 21 7.35321Z" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.52795 7.29432L11.708 11.8383C11.7971 11.8879 11.8974 11.9139 11.9995 11.9139C12.1015 11.9139 12.2018 11.8879 12.291 11.8383L20.5 7.27832M12 21.0003V12.0003" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="col-9 col-lg-6">
          <span class="loading-spinner-small ml-1 mr-4">
            <span class="loading-spinner-block-1"></span>
            <span class="loading-spinner-block-2"></span>
          </span>
          <div>
            <span class="tile-title pr-0 pl-0">${blockNumber}</span>
            <div class="tile-transactions">${
    // @ts-ignore
    window.localized['Block Processing']
    }</div>
          </div>
          </div>
          <div class="col-12 col-lg-4">
            <div>
              <div>
                Miner: Awaiting ...
              </div>
              <div>0 Transactions</div>
            </div>
          </div>
      </div>
    </div>
  `
}

function loadBlocks(store) {
  const url = store.getState().blocksPath

  store.dispatch({ type: 'START_BLOCKS_FETCH' })

  $.getJSON(url)
    .done(response => {
      store.dispatch({ type: 'BLOCKS_FETCHED', msg: humps.camelizeKeys(response) })
    })
    .fail(() => store.dispatch({ type: 'BLOCKS_REQUEST_ERROR' }))
    .always(() => store.dispatch({ type: 'BLOCKS_FINISH_REQUEST' }))
}

function bindBlockErrorMessage(store) {
  $('[data-selector="chain-block-list"] [data-selector="error-message"]').on('click', _event => loadBlocks(store))
}

$('a.ajax').on('click', (event) => {
  event.preventDefault()
  event.currentTarget.classList.add('disabled')

  $.get($(event.currentTarget).attr('href'), () => {
    openSuccessModal('Success', 'Email successfully resent', () => { window.location.reload() })
  }).fail((error) => {
    if (error.responseJSON && error.responseJSON.message) {
      if (error.status === 429) {
        openWarningModal('Warning', error.responseJSON.message)
      } else {
        openErrorModal('Error', error.responseJSON.message, false)
      }
    } else {
      openErrorModal('Error', 'Email resend failed', false)
    }
  })
    .always(() => {
      event.currentTarget.classList.remove('disabled')
    })
}
)
