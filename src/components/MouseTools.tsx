import { PollingChart } from './PollingChart'
import { ScrollWheelTester } from './ScrollWheelTester'

export function MouseTools() {
  return (
    <div className='space-y-6 p-6 pt-0'>
      <PollingChart />
      <ScrollWheelTester />
    </div>
  )
}
