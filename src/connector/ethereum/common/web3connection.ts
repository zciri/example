import { Observable } from "rxjs"
import { EthereumWallet } from "../domain"
import Web3 from "web3"
import { isListenable, isWithRemoveSubscriber } from "../../common/utils"
import { ConnectionState, STATE_DISCONNECTED } from "../../connection-state"

export function connectToWeb3(web3: Web3, provider: any, options: {
	disconnect?: () => Promise<void>
} = {}): Observable<ConnectionState<EthereumWallet>> {
	return new Observable<ConnectionState<EthereumWallet>>(subscriber => {
		const disconnect = () => {
			subscriber.next(STATE_DISCONNECTED)
			//subscriber.complete()
		}

		if (isListenable(provider)) {
			const externalDisconnectHandler = () => {
				disconnect()
			}

			provider.on("disconnected", externalDisconnectHandler)
			if (isWithRemoveSubscriber(provider)) {
				subscriber.add(() => {
					provider.removeListener("disconnected", externalDisconnectHandler)
				})
			}
		}

		Promise.all([web3.eth.getAccounts(), web3.eth.getChainId()]).then(([accounts, chainId]) => {
			const address = accounts[0]
			if (address) {
				const wallet: EthereumWallet = { chainId, address, provider: web3 }
				subscriber.next({ status: "connected" as const, connection: wallet, disconnect: options.disconnect })
			} else {
				disconnect()
			}
		}).catch(() => {
			disconnect()
		})
	})
}