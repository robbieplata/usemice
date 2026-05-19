export class MockHidDevice {
  readonly vendorId: number
  readonly productId: number
  readonly productName: string
  opened = true
  readonly collections: HIDCollectionInfo[] = []

  constructor(init: { vendorId: number; productId: number; productName: string }) {
    this.vendorId = init.vendorId
    this.productId = init.productId
    this.productName = init.productName
  }

  open(): Promise<void> {
    this.opened = true
    return Promise.resolve()
  }

  close(): Promise<void> {
    this.opened = false
    return Promise.resolve()
  }

  forget(): Promise<void> {
    this.opened = false
    return Promise.resolve()
  }

  sendReport(): Promise<void> {
    return Promise.reject(
      new Error('MockHidDevice.sendReport called: mock capabilities should not reach the transport'),
    )
  }

  sendFeatureReport(): Promise<void> {
    return Promise.reject(
      new Error('MockHidDevice.sendFeatureReport called: mock capabilities should not reach the transport'),
    )
  }

  receiveFeatureReport(): Promise<DataView> {
    return Promise.reject(
      new Error('MockHidDevice.receiveFeatureReport called: mock capabilities should not reach the transport'),
    )
  }

  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true
  }
}

export const asHidDevice = (mock: MockHidDevice): HIDDevice => mock as unknown as HIDDevice
