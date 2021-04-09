import { useEffect, useRef } from 'react'
import * as R from 'ramda'

export function useInterval(callback, delay) {
  const savedCallback = useRef()

  // Remember the last callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up interval
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }

    if (!R.isNil(delay)) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [callback, delay])
}

export const generateRandomString = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
