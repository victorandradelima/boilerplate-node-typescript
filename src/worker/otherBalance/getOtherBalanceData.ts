import { AxiosInstance } from "axios"
import { response } from "express"
import getCoinPrice from "../api/getCoinPrice"
import getOtherBalance from "../api/getOtherBalance"

type TStatus = 'active' | 'disabled'

type TOtherBalance = {
  id: string
  date: Date
  label: string
  status: TStatus
  amount: number
  currency: string
  obs?: string
}

const getOtherBalanceData = async (api: AxiosInstance) => {
  console.log('[araucaria-balance] binance - Get other balances ...')
  const otherBalanceResponse: Array<TOtherBalance> = await getOtherBalance(api)

  console.log('[araucaria-balance] binance - Get USD/BRL price ...')
  const usdBrlPrice = await getCoinPrice('tether', 'brl', api)
    .then(response => {
      return response.tether.brl
    })
    .catch(error => {
      console.log(error.message)
      return null
    })

  if (usdBrlPrice) {
    let sumUsdAmount = 0
    let sumBrlAmount = 0
    const otherBalanceUsdConvert = []
    for (let i = 0; i < otherBalanceResponse.length; i++) {
      if (otherBalanceResponse[i].currency === 'brl') {
        sumUsdAmount = (sumUsdAmount + (otherBalanceResponse[i].amount / usdBrlPrice))
        sumBrlAmount = sumBrlAmount + otherBalanceResponse[i].amount
        otherBalanceUsdConvert.push({
          ...otherBalanceResponse[i],
          amount: otherBalanceResponse[i].amount / usdBrlPrice,
          currency: 'usd'
        })
      } else if (otherBalanceResponse[i].currency === 'usd') {
        sumUsdAmount = sumUsdAmount + otherBalanceResponse[i].amount
        sumBrlAmount = (sumBrlAmount + (otherBalanceResponse[i].amount * usdBrlPrice))
        otherBalanceUsdConvert.push(otherBalanceResponse[i])
      }
    }

    const otherBalance = {
      status: 'success',
      message: 'OK',
      currencyAmount: {
        usd: sumUsdAmount,
        brl: sumBrlAmount
      },
      otherBalance: otherBalanceResponse,
      otherBalanceUsdConvert
    }

    return otherBalance
  }

  return {
    status: 'error',
    message: 'USD/BRL price not received'
  }
}

export default getOtherBalanceData