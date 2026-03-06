# Walkie-Talkie (Expo React Native)

A modular Expo React Native prototype for a peer-to-peer Bluetooth walkie-talkie with optional internet fallback.

## Features

- Bluetooth device discovery and connection
- Push-to-talk (PTT) button with chunked audio transmission (~80ms)
- Mesh packet format with sender/target/hop metadata
- Multi-hop relay support for nearby intermediary devices
- Internet fallback through Socket.IO when Bluetooth send fails
- Background listening task (Android foreground service)

## Project Structure

```
/src
  /components
    ConnectionStatus.tsx
    DeviceList.tsx
    PushToTalkButton.tsx
  /BluetoothManager
    index.ts
  /AudioManager
    index.ts
  /MeshRouter
    index.ts
  /screens
    HomeScreen.tsx
  /services
    AudioService.ts
    BluetoothService.ts
    InternetFallbackService.ts
    MeshService.ts
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `INTERNET_SERVER_URL` in `src/screens/HomeScreen.tsx`.
3. Start app:
   ```bash
   npm run start
   ```

## Notes

- Expo Go has limited native module support. For Bluetooth classic + background services, use a development build (`expo prebuild` + `expo run:android/ios`) or EAS build.
- Bluetooth discovery is filtered by device name prefix (`WT-APP`) to identify app peers.
