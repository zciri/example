import { useState } from "react"
import { isString } from "lodash"

export interface IRequestResult<T> {
	result: {
		type: "empty"
	} | {
		type: "complete"
		data: T
	} | {
		type: "error"
		error: string
	}
	setComplete: (data: T) => void
	setError: (error: any) => void
}

export function useRequestResult<T>(): IRequestResult<T> {
	const [result, setResult] = useState<IRequestResult<T>["result"]>({type: "empty"})

	return {
		result,
		setComplete: (data: T) => {
			setResult({
				type: "complete",
				data
			})
		},
		setError: (error: any) => {
			setResult({
				type: "error",
				error: isString(error) ? error : (error.message ? error.message : JSON.stringify(error))
			})
		},
	}
}