<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/banner-dark.png" />
  <source media="(prefers-color-scheme: light)" srcset="./docs/banner-light.png" />
  <img alt="BonjourZeroconf" src="./docs/banner-light.png" />
</picture>

# Bonjour Zeroconf 🇫🇷🥖

⚡ **High-performance Zeroconf/mDNS service discovery for React Native**

Discover devices and services on your local network using native Bonjour (iOS) and NSD (Android) APIs. Built with [Nitro Modules](https://nitro.margelo.com/) for maximum performance. Designed for both React Native and Expo. 🧑‍🚀

## ✨ Features

- 🏎️ **Racecar performance** – powered by Nitro Modules
- 🛡️ **Type-safe** – thanks to Nitro & Nitrogen
- 📡 **Cross-platform** – iOS (Bonjour) and Android (NSD)
- 📱 **Managing iOS permissions** - no need for extra libraries or custom code, just use `requestLocalNetworkPermission` or `useLocalNetworkPermission` before scanning!
- 🔄 **Real-time updates** – listen to scan results, state changes, and errors
- 🔭 **Multiple scanners** – run several independent scanners simultaneously for different service types
- 🧩 **Expo compatible** – includes a config plugin for development builds

## 📦 Installation

```sh
npm install https://github.com/tomathosauce/bonjour-zeroconf.git react-native-nitro-modules
```

> **Note:** `react-native-nitro-modules` is required as a peer dependency.

## 🧑‍🚀 Expo setup

This package contains native Swift and Kotlin code, so it cannot run in the
precompiled Expo Go app. Use an Expo development build (your own build of the
Expo client) instead.

Install the native module and a development client:

```sh
npm install https://github.com/tomathosauce/bonjour-zeroconf.git
npx expo install react-native-nitro-modules expo-dev-client
```

Add the plugin to `app.json`, `app.config.json`, or `app.config.js`. List every
Bonjour service type your app scans for:

```json
{
  "expo": {
    "plugins": [
      [
        "@dawidzawada/bonjour-zeroconf",
        {
          "bonjourServices": ["_http._tcp", "_printer._tcp"],
          "localNetworkUsageDescription": "Allow this app to discover devices on your local network."
        }
      ]
    ]
  }
}
```

The plugin preserves existing `NSBonjourServices` values and automatically adds
the two internal service types used by `requestLocalNetworkPermission()`.

Create and run the native development build:

```sh
npx expo run:ios
# or
npx expo run:android
```

Rebuild after changing native dependencies or plugin options. EAS Build can be
used instead of a local native build.

## ⚙️ Bare React Native iOS setup

On iOS, configure the permission message and every service type you scan for.

Add this to your `Info.plist`:

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>This app needs local network access to discover devices</string>
<key>NSBonjourServices</key>
<array>
    <!-- Needed for permissions -->
    <string>_bonjour._tcp</string>
    <string>_lnp._tcp</string>
    <!-- Add other service types you need here -->
</array>
```

## 🚀 Quick Start

```tsx
import {
  Scanner,
  requestLocalNetworkPermission,
  useIsScanning,
  type ScanResult,
} from '@dawidzawada/bonjour-zeroconf';
import { useEffect, useState } from 'react';

function App() {
  const [devices, setDevices] = useState<ScanResult[]>([]);

  const handleScan = async () => {
    const granted = await requestLocalNetworkPermission();
    if (granted) {
      Scanner.scan('_bonjour._tcp', 'local');
    }
  };

  const handleStop = async () => {
    Scanner.stop();
  };

  const handleCheck = async () => {
    Alert.alert(`Is scanning? ${Scanner.isScanning}`);
  };

  useEffect(() => {
    // Listen for discovered devices
    const { remove } = Scanner.listenForScanResults((scan) => {
      setDevices(scan);
    });

    return () => {
      remove();
    };
  }, []);

  return (
    <View>
      <Button title={'Scan'} onPress={handleScan} />
      <Button title={'Stop'} onPress={handleStop} />
      {devices.map((device) => (
        <Text key={device.name}>
          {device.name} - {device.ipv4}:{device.port}
        </Text>
      ))}
    </View>
  );
}
```

---

## 🔭 Multiple Scanners

For convenience, the library exports a `Scanner` singleton that covers most use cases. Each scanner can only scan one service type at a time, so if you need to discover multiple service types simultaneously, use the `BonjourScanner` class to create as many independent scanners as you need.

```tsx
import { BonjourScanner } from '@dawidzawada/bonjour-zeroconf';

const printerScanner = new BonjourScanner({ id: 'printers' });
const httpScanner = new BonjourScanner({ id: 'http' });

// Both run in parallel, scanning different service types
printerScanner.scan('_printer._tcp', 'local');
httpScanner.scan('_http._tcp', 'local');
```

The optional `id` is appended to log messages, making it easy to distinguish between scanners during debugging.

---

## 📖 API Reference

### **Scanner**

A pre-created `BonjourScanner` singleton exported for convenience. Use it when you only need to scan one service type at a time.

### **BonjourScanner**

#### `scan(type: string, domain: string, options?: ScanOptions)`

Start scanning for services.

```ts
Scanner.scan('_http._tcp', 'local');
```

```ts
Scanner.scan('_printer._tcp', 'local', {
  addressResolveTimeout: 10000, // ms
});
```

**Common service types:**

- `_http._tcp` – HTTP servers
- `_ssh._tcp` – SSH servers
- `_airplay._tcp` – AirPlay devices
- `_printer._tcp` – Network printers

#### `scanFor(time: number, type: string, domain: string, options?: ScanOptions)`

Scan for services for a specified duration and return results as a Promise.

```ts
const devices = await Scanner.scanFor(15, '_http._tcp', 'local');
console.log('Found devices:', devices);
```

```ts
const devices = await Scanner.scanFor(25, '_printer._tcp', 'local', {
  addressResolveTimeout: 10000, // ms
});
```

**Parameters:**

- `time` – Duration in seconds to scan before stopping
- `type` – Service type to discover
- `domain` – Domain to scan (typically `'local'`)
- `options` – Optional scan configuration

**Returns:** `Promise<ScanResult[]>` – Array of discovered services

#### `stop()`

Stop scanning and clear cached results.

```ts
Scanner.stop();
```

#### `listenForScanResults(callback)`

Listen for discovered services.

```ts
const listener = Scanner.listenForScanResults((results: ScanResult[]) => {
  console.log('Found devices:', results);
});

// Clean up listener
listener.remove();
```

#### `listenForScanState(callback)`

Listen for scanning state changes.

```ts
const listener = Scanner.listenForScanState((isScanning: boolean) => {
  console.log('Scanning:', isScanning);
});

// Clean up listener
listener.remove();
```

#### `listenForScanFail(callback)`

Listen for scan failures.

```ts
const listener = Scanner.listenForScanFail((error: BonjourFail) => {
  console.log('Scan failed:', error);
});

// Clean up listener
listener.remove();
```

---

### **Hooks**

#### `useIsScanning()`

React hook that returns the current scanning state.

```tsx
const isScanning = useIsScanning();
```

#### `useLocalNetworkPermission()` (iOS only)

React hook for managing local network permission.

```tsx
const { status, request } = useLocalNetworkPermission();
```

---

### **Functions**

#### `requestLocalNetworkPermission()`

Displays prompt to request local network permission, always returns `true` on Android.

```tsx
const granted = await requestLocalNetworkPermission();
```

---

### **Types**

```ts
interface ScanResult {
  name: string;
  ipv4?: string;
  ipv6?: string;
  hostname?: string;
  port?: number;
}

interface ScanOptions {
  addressResolveTimeout?: number; // milliseconds, default: 10000
}

enum BonjourFail {
  DISCOVERY_FAILED = 'DISCOVERY_FAILED',
  RESOLVE_FAILED = 'RESOLVE_FAILED',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
}
```

## Nitro compatibility table

| Bonjour version 🥖 | Recommended Nitro Version |
| ------------------ | ------------------------- |
| 2.1.X              | 0.33.X                    |
| 2.0.X              | 0.32.X                    |
| 1.2.X              | 0.32.X                    |
| 1.1.X              | 0.31.X                    |
| 1.0.X              | 0.31.X                    |

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## Credits

- [Nitro Modules](https://nitro.margelo.com/) - High-performance native module framework
- [mrousavy](https://github.com/mrousavy) - Creator of Nitro Modules
- [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob) - Library template

Solution for handling permissions is based on [react-native-local-network-permission](https://github.com/neurio/react-native-local-network-permission)

## License

MIT

---

**Made with ❤️ for the React Native community**
