import { JsonRpcProvider, Contract } from 'ethers'

const FEED_ABI = ['function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)']

const RPC = import.meta.env.VITE_RPC_URL || 'https://ethereum-rpc.publicnode.com'

let cached = { price: null, ts: 0 }

export function getPublicProvider() {
  return new JsonRpcProvider(RPC)
}

export async function getEthPriceUsd() {
  if (cached.price && Date.now() - cached.ts < 30000) return cached.price
  const provider = getPublicProvider()
  const feed = new Contract(import.meta.env.VITE_ETH_USD_FEED, FEED_ABI, provider)
  const [, answer] = await feed.latestRoundData()
  const price = Number(answer) / 1e8
  cached = { price, ts: Date.now() }
  return price
}

const RECOVERY_ABI_MIN = [
  'function recoveries(address) view returns (uint256 amount, uint16 feePercent, uint8 status)',
  'function quoteFeeWei(address wallet) view returns (uint256)'
]

export async function getRecoveryFromChain(wallet) {
  const provider = getPublicProvider()
  const c = new Contract(import.meta.env.VITE_RECOVERY_CONTRACT, RECOVERY_ABI_MIN, provider)
  try {
    const [rec, feeWei] = await Promise.all([
      c.recoveries(wallet),
      c.quoteFeeWei(wallet)
    ])
    return {
      hasRecovery: Number(rec.status) === 1,
      amount: rec.amount,
      feePercent: Number(rec.feePercent),
      feeWei
    }
  } catch {
    return { hasRecovery: false, amount: 0n, feePercent: 0, feeWei: 0n }
  }
}

// Standard claimRecovery gas budget (typical ERC20 transferFrom + storage writes)
const CLAIM_GAS_LIMIT = 180000n

export async function estimateNetworkFeeWei() {
  const provider = getPublicProvider()
  const feeData = await provider.getFeeData()
  const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || 30000000000n
  return CLAIM_GAS_LIMIT * gasPrice
}

