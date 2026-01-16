import { useCallback, useEffect, useState } from 'react'
import type { ReadyDevice, FailedDevice } from '../device/device'
import { connectDevice } from '../device/hid'

const useDevice = (options?: HIDDeviceRequestOptions) => {
  const [device, setDevice] = useState<ReadyDevice | FailedDevice | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onMount = async () => {
    const deviceResult = await connectDevice(options)
    if (deviceResult.error) {
      setError(deviceResult.error.message)
      return
    }
    setDevice(deviceResult.value)
  }

  useEffect(() => {
    onMount()
  }, [])

  const requestDevice = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const deviceResult = await connectDevice(options)
      if (deviceResult.error) {
        if (deviceResult.error instanceof Error) {
          setError('User cancelled device request')
          return
        }
        switch (deviceResult.error.name) {
          case 'DeviceNotSupportedError':
            setError('User cancelled device request')
            break
          case 'RequestHidDeviceError':
            setError('The selected device is not supported')
            break
        }
        return
      }
      setDevice(deviceResult.value)
    } catch (e) {
      console.error('Unknown Error requesting device:', e)
      setError('An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const disconnect = useCallback(() => {
    device?.hid.close()
    device?.hid.forget()
    setDevice(null)
  }, [device])

  return { device, isLoading, error, requestDevice, disconnect }
}

export default useDevice
