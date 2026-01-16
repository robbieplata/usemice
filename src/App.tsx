import './App.css'
import useDevice from './lib/hooks/useDevice'
import DeviceView from './components/DeviceView'

function App() {
  const { device, isLoading, error, requestDevice, disconnect } = useDevice()

  if (isLoading) {
    return <p>Connecting to device...</p>
  }

  return (
    <>
      <div className='card'>
        {<button onClick={device ? disconnect : requestDevice}>{device ? 'Disconnect' : 'Connect'}</button>}
        {error && <p className='error'>{error}</p>}
        {device && <DeviceView device={device} />}
      </div>
    </>
  )
}

export default App
