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

  async open(): Promise<void> {
    this.opened = true
  }

  async close(): Promise<void> {
    this.opened = false
  }

  async forget(): Promise<void> {
    this.opened = false
  }

  async sendReport(): Promise<void> {
    throw new Error('MockHidDevice.sendReport called: mock capabilities should not reach the transport')
  }

  async sendFeatureReport(): Promise<void> {
    throw new Error('MockHidDevice.sendFeatureReport called: mock capabilities should not reach the transport')
  }

  async receiveFeatureReport(): Promise<DataView> {
    throw new Error('MockHidDevice.receiveFeatureReport called: mock capabilities should not reach the transport')
  }

  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true
  }
}

export const asHidDevice = (mock: MockHidDevice): HIDDevice => mock as unknown as HIDDevice
