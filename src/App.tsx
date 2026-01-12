import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { connectDevice, DeviceNotSupportedError, OpenHidDeviceError, RequestHidDeviceError } from './lib/device/hid'
import { isCapableOf, isStatus } from './lib/device/device'

function App() {
  const connect = async () => {
    try {
      const device = await connectDevice()
      if (isStatus(device, 'Failed')) {
        console.error('Device is not ready:', device)
        return
      } else {
        if (isCapableOf(device, ['polling2'])) {
          console.log('Device supports polling2 capability')
        }
      }
    } catch (error) {
      if (error instanceof DeviceNotSupportedError) {
        console.error(`Device not supported: VID=0x${error.vid.toString(16)}, PID=0x${error.pid.toString(16)}`)
      } else if (error instanceof OpenHidDeviceError) {
        console.error('Failed to open HID device:', error)
      } else if (error instanceof RequestHidDeviceError) {
        console.error('Failed to request HID device:', error)
      } else {
        console.error('Failed to connect device:', error)
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
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App
