# Realtime Captioning Service

A backend service that simulates real-time captioning and tracks usage.

## Features

- WebSocket endpoint for real-time captioning
- REST endpoint for usage tracking
- Usage limits enforcement
- In-memory usage tracking
- Lorem ipsum text generation for simulated captions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

## Testing the Service

### WebSocket Endpoint
The WebSocket server runs on port 3001. Connect with a client ID header.

ws://localhost:3001

### Usage Endpoint
GET http://localhost:3000/api/usage/:clientId

Example response:
```json
{
  "clientId": "user123",
  "packetCount": 50,
  "usageMs": 5000,
  "usageSeconds": 5
}
```

## Testing WebSocket Functionality

### Option 1: Using Postman

1. Open Postman
2. Create a new WebSocket request
3. Enter WebSocket URL: `ws://localhost:3001`
4. Add required header:
   - Key: `x-client-id`
   - Value: `test-user-123`
5. Click "Connect"
6. In the message input, type: `audio-packet`
7. Click "Send" repeatedly to simulate audio packets
   - Each packet represents 100ms of audio
   - Captions will be generated every 300ms
   - Connection will close after 60 seconds (60000ms) of usage

### Option 2: Using Test Script

Create a file named `test-websocket.js`:

```javascript
import WebSocket from 'ws';

const TEST_DURATION_MS = 5000; // Run test for exactly 5 seconds
const PACKET_INTERVAL_MS = 100; // Send packet every 100ms
const EXPECTED_PACKETS = 50; // We expect exactly 50 packets for 5 seconds
const CLIENT_ID = 'test-user-123';

// Connect to WebSocket server
const ws = new WebSocket('ws://localhost:3001', {
    headers: {
        'x-client-id': CLIENT_ID
    }
});

let packetsSent = 0;
let packetInterval;

ws.on('open', () => {
    console.log('Connected to WebSocket server');
    
    // Send audio packets every 100ms
    packetInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN && packetsSent < EXPECTED_PACKETS) {
            ws.send('audio-packet');
            packetsSent++;
            console.log(`Sent audio packet #${packetsSent}/50`);
            
            // If we've sent all packets, close the connection
            if (packetsSent === EXPECTED_PACKETS) {
                console.log(`Test completed. Sent exactly ${EXPECTED_PACKETS} packets (${EXPECTED_PACKETS * 100}ms of audio)`);
                clearInterval(packetInterval);
                ws.close();
            }
        }
    }, PACKET_INTERVAL_MS);
});

ws.on('message', (data) => {
    const response = JSON.parse(data.toString());
    console.log('Received caption:', response.caption);
    console.log('Usage stats:', response.stats);
});

ws.on('close', (code, reason) => {
    console.log('Connection closed:', code, reason.toString());
    if (packetInterval) {
        clearInterval(packetInterval);
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (packetInterval) {
        clearInterval(packetInterval);
    }
});
```

To run the test script:

1. Install dependencies:
```bash
npm install ws
```

2. Save the script as `test-websocket.js`

3. Run the script:
```bash
node test-websocket.js
```

Expected behavior:
- Script will connect to WebSocket server
- Send audio packets every 100ms
- Receive captions every 300ms
- Will run for 5 seconds, sending 50 packets (5000ms of audio)

## Implementation Details

- Each audio packet represents 100ms of speech
- Captions are generated every 300ms
- Usage limit is set to 60 seconds per client
- Usage is tracked in-memory using a Map
- Simple client identification using x-client-id header