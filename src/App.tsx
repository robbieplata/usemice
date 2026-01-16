import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { connectDevice, DeviceNotSupportedError, OpenHidDeviceError, RequestHidDeviceError } from './lib/device/hid'
import { isCapableOf, isFailed, type Device } from './lib/device/device'
import { dpi, idleTime, polling } from './lib/device/commands'

const DeviceInfo = observer(({ device }: { device: Device }) => {
  return (
    <div className='device-info'>
      <h2>{device.name}</h2>
      {device.error && <p className='error'>Error: {device.error.message}</p>}
      {isCapableOf(device, ['serial']) && <p>Serial: {device.capabilityData.serial}</p>}
      {isCapableOf(device, ['firmwareVersion']) && (
        <p>
          Firmware: v{device.capabilityData.firmwareVersion.major}.{device.capabilityData.firmwareVersion.minor}
        </p>
      )}
      {isCapableOf(device, ['chargeLevel']) && (
        <p>Charge: {device.capabilityData.chargeLevel.percentage.toFixed(0)}%</p>
      )}
      {isCapableOf(device, ['chargeStatus']) && (
        <p>{device.capabilityData.chargeStatus.status ? 'Charging' : 'Not Charging'}</p>
      )}
      {isCapableOf(device, ['idleTime']) && (
        <div>
          <p>Idle time: {device.capabilityData.idleTime.seconds}s</p>
          <input
            type='range'
            step={1}
            min={device.limits.idleTime.minSeconds}
            max={device.limits.idleTime.maxSeconds}
            value={device.capabilityData.idleTime.seconds}
            onChange={(e) =>
              device.capabilityData.idleTime && idleTime.set(device, { seconds: parseInt(e.target.value) })
            }
          />
        </div>
      )}
      {isCapableOf(device, ['dpi']) && (
        <div>
          <p>Dpi: {device.capabilityData.dpi.x}</p>
          <div>
            {device.limits.dpi && (
              <input
                type='range'
                min={device.limits.dpi.minDpi}
                max={device.limits.dpi.maxDpi}
                value={device.capabilityData.dpi.x}
                onChange={(e) => dpi.set(device, { x: parseInt(e.target.value), y: parseInt(e.target.value) })}
              />
            )}
          </div>
        </div>
      )}
      {isCapableOf(device, ['polling']) && (
        <div>
          <p>Polling Rate: {device.capabilityData.polling.interval} Hz</p>
          {device.limits.polling && (
            <select
              value={device.capabilityData.polling.interval}
              onChange={(e) => polling.set(device, { interval: parseInt(e.target.value) })}
            >
              {device.limits.polling.supportedIntervals.map((interval) => (
                <option key={interval} value={interval}>
                  {interval} Hz
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  )
})

function App() {
  const [device, setDevice] = useState<Device | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    setError(null)
    try {
      const device = await connectDevice()
      if (isFailed(device)) {
        setError(device.error.message)
        return
      }
      setDevice(device)
    } catch (err) {
      if (err instanceof DeviceNotSupportedError) {
        setError(`Device not supported: VID=0x${err.vid.toString(16)}, PID=0x${err.pid.toString(16)}`)
      } else if (err instanceof OpenHidDeviceError) {
        setError(`Failed to open HID device: ${err.message}`)
      } else if (err instanceof RequestHidDeviceError) {
        setError(`Failed to request HID device: ${err.message}`)
      } else {
        setError(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  return (
    <>
      <div>
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <button onClick={connect}>Connect</button>
        {error && <p className='error'>{error}</p>}
        {device && <DeviceInfo device={device} />}
      </div>
      <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App
