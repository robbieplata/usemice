# usemice

A web-based configuration tool for mice using the WebHID API.

## Development

```bash
bun install
bun dev
```

## Adding Device Support

Device support is defined in [src/lib/device/devices.ts](src/lib/device/devices.ts). Each device profile specifies the product ID and available capabilities.

If your device isn't working or a feature is missing:

1. Find your device's USB Product ID (PID) using browser DevTools or `lsusb`
2. Use [USBPcap](https://desowin.org/usbpcap/) / Wireshark to capture HID traffic and analyze the protocol
3. Check [OpenRazer's device list](https://github.com/openrazer/openrazer) for existing protocol details
4. Add or modify the device in `devices.ts`

Capabilities are implemented in [src/lib/capabilities/](src/lib/capabilities/) by vendor. Each capability defines `get` and/or `set` commands using the vendor's HID protocol.

## Additional Vendor Support

To support a different manufacturer:

1. Create a new folder under `src/lib/capabilities/` for the protocol
2. Implement capability commands following the same interface as existing capabilities
3. Create a report class similar to `RazerReport` in `src/lib/device/razer/` that handles the protocol's packet structure, checksums, etc.
4. Add device profiles in `devices.ts` pointing to your new capabilities
5. Use [USBPcap](https://desowin.org/usbpcap/) / Wireshark to derrive the standard protocol by capturing traffic from the manufacturer's official software

## Acknowledgments

Protocol information derived from [OpenRazer](https://github.com/openrazer/openrazer), licensed under GPL-2.0-or-later.

## License

[MIT](LICENSE)
