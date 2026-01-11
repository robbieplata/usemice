import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Effect } from 'effect'
import { connectDevice } from './lib/device/hid'

function App() {
  const connect = async () => {
    const device = await Effect.runPromise(connectDevice().pipe(Effect.either))
    if (device._tag === 'Left') {
      switch (device.left._tag) {
        case 'DeviceNotSupportedError':
          console.error(
            `Device not supported: VID=0x${device.left.vid.toString(16)}, PID=0x${device.left.pid.toString(16)}`
          )
          break
        case 'OpenHidDeviceError':
          console.error('Failed to open HID device:', device.left)
          break
        case 'RequestHidDeviceError':
          console.error('Failed to request HID device:', device.left)
          break
        default:
          console.error('Failed to connect device:', device.left)
      }
    } else {
      console.log('Connected device', device.right)
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
