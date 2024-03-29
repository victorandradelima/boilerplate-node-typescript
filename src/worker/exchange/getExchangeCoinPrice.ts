import sleep from "@src/utils/sleep"
import { AxiosInstance } from "axios"
import getLockExchanges from "../settings/getLockExchanges"

const usdSymbols = ['USD', 'USDT', 'USDC', 'TUSD', 'GUSD', 'BUSD', 'LDUSDT', 'SRM_LOCKED', 'LUNC', 'LUNA2_LOCKED', 'LUNA2']

const ignoreSymbols = ['NFT']

const getExchangeCoinPrice = async (exchangeSelected: string, filteredBalance: Balances, api: AxiosInstance) => {
    console.log(`[araucaria-balance] ${exchangeSelected} - Get pair price`)
    const settingLockExchanges = await getLockExchanges(api)
		let status = true
    if(!settingLockExchanges){
			for (const key in filteredBalance) {
				await sleep(1000)
				const symbol = key.toUpperCase()
				if(!ignoreSymbols.includes(symbol)){
					if(usdSymbols.includes(symbol)){
						filteredBalance[key].usdValue = filteredBalance[key].total
						global.detailedConsole && console.log(symbol, `${key}/${key}`, 1.00, filteredBalance[key].usdValue)
					} else {
						const exchangePairPrice = await api.get(`/exchange/coin-price/select?exchange=${exchangeSelected}&symbol=${symbol}`)
						.then(response => {
							return response.data
						})
						.catch(error => {
							console.log(error.message)
						})
						if(exchangePairPrice){
							if(exchangePairPrice.status === 'ok'){
								filteredBalance[key].usdValue = filteredBalance[key].total * exchangePairPrice.price
								global.detailedConsole && console.log(symbol, exchangePairPrice.pair, exchangePairPrice.price, filteredBalance[key].usdValue)
							} else {
								console.log(`[araucaria-balance] ${exchangeSelected} - Erro to receveid ${key} prices`)
								filteredBalance[key].usdValue = 0
								// status = false
							}
						} else {
							console.log(`[araucaria-balance] ${exchangeSelected} - No received pair price: ${symbol}`)
							filteredBalance[key].usdValue = 0
							// status = false
						}
					}
				} else {
					console.log(`[araucaria-balance] ${exchangeSelected} - Symbol ignored: ${symbol}`)
					filteredBalance[key].usdValue = 0
				}
			}
    } else {
			console.log(`[araucaria-balance] ${exchangeSelected} - Conditional to lock exchanges: not necessary get usdValue`)
		}
    return status
  }
  
  export default getExchangeCoinPrice