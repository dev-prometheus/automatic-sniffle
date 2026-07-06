import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet],
  projectId,
  metadata: {
    name: 'GE-AS Portal',
    description: 'Access verified GE-AS holdings',
    url: 'https://portal.ge-as.com',
    icons: []
  },
  features: {
    analytics: false,
    email: false,
    socials: false
  },
  themeMode: 'dark'
})
