import { observer } from 'mobx-react-lite'
import { flowResult } from 'mobx'
import './App.css'
import DeviceView from './components/DeviceView'
import { useStore } from './stores'
import { noop } from 'lodash'

const App = observer(() => {
  const {
    deviceStore: { addDevice, requestDevice, removeDevice, selectedDevice, devices, setSelectedDeviceId }
  } = useStore()

  const connect = async () => {
    const requestResult = await flowResult(requestDevice())
    if (!requestResult.error) {
      const addResult = await flowResult(addDevice(requestResult.value))
      if (addResult.error) {
        console.error('Failed to add device:', addResult.error)
      }
    }
  }

  const disconnect = () => (selectedDevice ? removeDevice(selectedDevice) : noop())

  return (
    <>
      <div className='card'>
        {devices.map((device) => (
          <button key={device.hid.productId} onClick={() => setSelectedDeviceId(device.id)}>
            <span>
              {device.hid.productName} - {device.status}
            </span>
          </button>
        ))}
      </div>
      <div className='card'>
        {<button onClick={!selectedDevice ? connect : disconnect}>{selectedDevice ? 'Disconnect' : 'Connect'}</button>}
        {selectedDevice !== undefined && <DeviceView device={selectedDevice} />}
      </div>
    </>
  )
})

export default App
