import { observer } from 'mobx-react-lite'
import { debounce } from 'lodash'
import { polling, dpiStages, polling2, idleTime } from '../lib/capabilities'
import { isCapableOf, isStatus, type IDevice } from '../lib/device/device'
import { Button } from './ui/button'
import { Slider } from '@/components/ui/slider'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DropdownMenuContent } from './ui/dropdown-menu'
import { Input } from './ui/input'
import { useMemo } from 'react'
import { useStore } from '@/stores'

const DeviceView = observer(({ device }: { device: IDevice }) => {
  const {
    deviceStore: { removeDevice }
  } = useStore()

  if (isStatus(device, 'Failed')) {
    return (
      <div className='rounded-xl p-4'>
        <h2 className='text-base font-semibold'>{device.hid.productName}</h2>
        <p className='mt-1 text-sm'>Device failed to initialize: {device.error.message}</p>
      </div>
    )
  }

  if (isStatus(device, 'Ready') === false) return null

  const disconnect = () => {
    if (!device) return
    removeDevice(device, true)
  }

  const setDpiDebounced = useMemo(
    () =>
      debounce((index: number, value: number) => {
        if (isCapableOf(device, ['dpiStages'])) {
          const newDpiLevels = [...device.capabilityData.dpiStages.dpiLevels]
          newDpiLevels[index] = [value, value]
          dpiStages.set(device, {
            ...device.capabilityData.dpiStages,
            dpiLevels: newDpiLevels
          })
        }
      }, 150),
    [device]
  )

  return (
    <>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h2 className='truncate text-lg font-semibold'>{device.hid.productName}</h2>
          {device.error && <p className='mt-1 text-sm'>Error: {device.error.message}</p>}
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={disconnect}>{'Disconnect'}</Button>
        </div>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {isCapableOf(device, ['serial']) && (
          <div className='rounded-xl border p-3'>
            <p className='text-xs font-medium'>Serial</p>
            <p className='mt-1 font-mono text-sm'>{device.capabilityData.serial.serialNumber}</p>
          </div>
        )}

        {isCapableOf(device, ['firmwareVersion']) && (
          <div className='rounded-xl border p-3'>
            <p className='text-xs font-medium'>Firmware</p>
            <p className='mt-1 text-sm'>
              v{device.capabilityData.firmwareVersion.major}.{device.capabilityData.firmwareVersion.minor}
            </p>
          </div>
        )}

        {isCapableOf(device, ['chargeLevel']) && (
          <div className='rounded-xl border p-3'>
            <p className='text-xs font-medium'>Battery</p>
            <p className='mt-1 text-sm'>{device.capabilityData.chargeLevel.percentage.toFixed(0)}%</p>
          </div>
        )}

        {isCapableOf(device, ['chargeStatus']) && (
          <div className='rounded-xl border p-3'>
            <p className='text-xs font-medium'>Charge status</p>
            <p className='mt-1 text-sm'>{device.capabilityData.chargeStatus.status ? 'Charging' : 'Not charging'}</p>
          </div>
        )}
      </div>

      <div className='mt-6 space-y-6'>
        {isCapableOf(device, ['idleTime']) && (
          <section className='space-y-2'>
            <div className='rounded-xl border p-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>Idle time</h3>
                <span className='text-sm tabular-nums'>{device.capabilityData.idleTime.seconds}s</span>
              </div>
              <Slider
                className='mt-4'
                step={1}
                min={device.capabilityInfo.idleTime.minSeconds}
                max={device.capabilityInfo.idleTime.maxSeconds}
                value={[device.capabilityData.idleTime.seconds]}
                onValueChange={([seconds]) => {
                  idleTime.set(device, { seconds })
                }}
              />
              <div className='mt-2 flex justify-between text-xs'>
                <span>{device.capabilityInfo.idleTime.minSeconds}s</span>
                <span>{device.capabilityInfo.idleTime.maxSeconds}s</span>
              </div>
            </div>
          </section>
        )}

        {isCapableOf(device, ['dpiStages']) && (
          <section className='space-y-3'>
            <div className='space-y-3 border rounded-xl p-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>DPI stages</h3>
                <span className='text-sm'>
                  Active: <span className='font-medium'>{device.capabilityData.dpiStages.activeStage}</span>
                </span>
              </div>

              {device.capabilityData.dpiStages.dpiLevels.map((level, index) => {
                const isActive = device.capabilityData.dpiStages.activeStage === index + 1
                const value = level[0]

                return (
                  <div key={index + 1}>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                      <div className='flex items-center gap-2'>
                        <Button
                          disabled={isActive}
                          onClick={() =>
                            dpiStages.set(device, {
                              ...device.capabilityData.dpiStages,
                              activeStage: index + 1
                            })
                          }
                        >
                          Stage {index + 1}
                        </Button>

                        <div className='text-sm'>
                          <span className='font-medium tabular-nums '>{value}</span> DPI
                        </div>
                      </div>

                      <div className='flex w-full items-center gap-3'>
                        <div className='flex-1'>
                          <Slider
                            step={100}
                            min={device.capabilityInfo.dpiStages.minDpi}
                            max={device.capabilityInfo.dpiStages.maxDpi}
                            value={[value]}
                            onValueChange={([next]) => setDpiDebounced(index, next)}
                          />
                          <div className='mt-2 flex justify-between text-xs'>
                            <span>{device.capabilityInfo.dpiStages.minDpi}</span>
                            <span>{device.capabilityInfo.dpiStages.maxDpi}</span>
                          </div>
                        </div>

                        <Input
                          className='w-24'
                          type='number'
                          min={device.capabilityInfo.dpiStages.minDpi}
                          max={device.capabilityInfo.dpiStages.maxDpi}
                          step={100}
                          value={value}
                          onChange={(e) => {
                            const next = Number(e.target.value)
                            if (Number.isNaN(next)) return

                            const newDpiLevels = [...device.capabilityData.dpiStages.dpiLevels]
                            newDpiLevels[index] = [next, next]
                            dpiStages.set(device, {
                              ...device.capabilityData.dpiStages,
                              dpiLevels: newDpiLevels
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {isCapableOf(device, ['polling2']) && (
          <section className='space-y-2'>
            <div className='flex items-center justify-between rounded-xl border p-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>Polling rate</h3>
              </div>
              <p className='text-sm'>
                Current: <span className='font-medium tabular-nums'>{device.capabilityData.polling2.interval}</span> Hz
              </p>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline'>{device.capabilityData.polling2.interval} Hz</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='min-w-36'>
                  {device.capabilityInfo.polling2.supportedIntervals.map((interval) => (
                    <DropdownMenuItem
                      key={interval}
                      onClick={() => polling2.set(device, { interval })}
                      className='flex items-center justify-between'
                    >
                      <span className='tabular-nums'>{interval} Hz</span>
                      {interval === device.capabilityData.polling2.interval && <span className='text-xs'>Current</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>
        )}

        {isCapableOf(device, ['polling']) && (
          <section className='space-y-2'>
            <h3 className='text-sm font-semibold'>Polling rate</h3>

            <div className='flex items-center justify-between rounded-xl border p-3'>
              <p className='text-sm'>
                Current: <span className='font-medium tabular-nums'>{device.capabilityData.polling.interval}</span> Hz
              </p>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline'>{device.capabilityData.polling.interval} Hz</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='min-w-36'>
                  {device.capabilityInfo.polling.supportedIntervals.map((interval) => (
                    <DropdownMenuItem
                      key={interval}
                      onClick={() => polling.set(device, { interval })}
                      className='flex items-center justify-between'
                    >
                      <span className='tabular-nums'>{interval} Hz</span>
                      {interval === device.capabilityData.polling.interval && <span className='text-xs'>Current</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>
        )}
      </div>
    </>
  )
})

export default DeviceView
