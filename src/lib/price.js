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

// Reads full recovery state. Safe when status == Recovered (2) because we only
// call quoteFeeWei when status == Pending (1).
export async function getRecoveryState(wallet) {
  const provider = getPublicProvider()
  const c = new Contract(import.meta.env.VITE_RECOVERY_CONTRACT, RECOVERY_ABI_MIN, provider)
  try {
    const rec = await c.recoveries(wallet)
    const status = Number(rec.status) // 0=None, 1=Pending, 2=Recovered
    let feeWei = 0n
    if (status === 1) {
      try { feeWei = await c.quoteFeeWei(wallet) } catch {}
    }
    return {
      status,
      amount: rec.amount,
      feePercent: Number(rec.feePercent),
      feeWei
    }
  } catch {
    return { status: 0, amount: 0n, feePercent: 0, feeWei: 0n }
  }
}

// Back-compat wrapper for existing callers that expect the old shape.
export async function getRecoveryFromChain(wallet) {
  const s = await getRecoveryState(wallet)
  return {
    hasRecovery: s.status === 1,
    amount: s.amount,
    feePercent: s.feePercent,
    feeWei: s.feeWei
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

