import { AxiosInstance } from "axios"

const getSolanaBalance = async (api: AxiosInstance, solanaWallet: string): Promise<any> => {
  console.log(`[araucaria-balance] Get Solana balances in wallet ${solanaWallet} ...`)
  const apiResponse = await api.get(`blockchain/solana/wallet/balance?pubKey=${solanaWallet}`)
    .then(response => {
      return response.data
    })
    .catch(error => {
      console.log(error.message)
      return undefined
    })

  console.log(`[araucaria-balance] Get Solana balances done`)
  return apiResponse
}

export default getSolanaBalance