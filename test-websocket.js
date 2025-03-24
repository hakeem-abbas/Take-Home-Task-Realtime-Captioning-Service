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