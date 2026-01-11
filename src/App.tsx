import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Effect } from 'effect'
import { connectDevice } from './lib/device/hid'

function App() {
  const connect = async () => {
    try {
      const pendingDevice = await Effect.runPromise(connectDevice())
      console.log('Connected device', pendingDevice)
      const readyDevice = await Effect.runPromise(pendingDevice.initialize())
      console.log(readyDevice)
    } catch (e) {
      console.error('Failed to connect device', e)
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
