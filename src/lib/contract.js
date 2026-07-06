import { BrowserProvider, Contract, formatEther, formatUnits } from 'ethers'

export const RECOVERY_ABI = [
  'function recoveries(address) view returns (uint256 amount, uint16 feePercent, uint8 status)',
  'function quoteFeeWei(address wallet) view returns (uint256)',
  'function getEthPriceUsd() view returns (uint256)',
  'function claimRecovery() payable',
  'event RecoveryClaimed(address indexed wallet, uint256 amount, uint256 ethFee)'
]

export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)'
]

export function getProvider(walletProvider) {
  return new BrowserProvider(walletProvider)
}

export async function getRecoveryContract(walletProvider, withSigner = false) {
  const provider = getProvider(walletProvider)
  const runner = withSigner ? await provider.getSigner() : provider
  return new Contract(import.meta.env.VITE_RECOVERY_CONTRACT, RECOVERY_ABI, runner)
}

export async function getOtusdtContract(walletProvider) {
  const provider = getProvider(walletProvider)
  return new Contract(import.meta.env.VITE_OTUSDT_CONTRACT, ERC20_ABI, provider)
}

export async function getEthBalance(walletProvider, address) {
  const provider = getProvider(walletProvider)
  const bal = await provider.getBalance(address)
  return { wei: bal, eth: formatEther(bal) }
}

export async function getOtusdtBalance(walletProvider, address) {
  const c = await getOtusdtContract(walletProvider)
  const [bal, dec] = await Promise.all([c.balanceOf(address), c.decimals()])
  return formatUnits(bal, dec)
}
