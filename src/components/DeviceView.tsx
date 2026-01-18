import { observer } from 'mobx-react-lite'
import { idleTime, dpi, polling } from '../lib/capabilities'
import { isCapableOf, isStatus, type IDevice } from '../lib/device/device'

const DeviceView = observer(({ device }: { device: IDevice }) => {
  if (isStatus(device, 'Failed')) {
    return (
      <div className='device-info'>
        <h2>{device.hid.productName}</h2>
        <p className='error'>Device failed to initialize: {device.error.message}</p>
      </div>
    )
  }

  if (isStatus(device, 'Ready') === false) {
    return
  }

  return (
    <div className='device-info'>
      <h2>{device.hid.productName}</h2>
      {device.error && <p className='error'>Error: {device.error.message}</p>}
      {isCapableOf(device, ['serial']) && <p>Serial: {device.capabilityData.serial.serialNumber}</p>}
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

export default DeviceView
