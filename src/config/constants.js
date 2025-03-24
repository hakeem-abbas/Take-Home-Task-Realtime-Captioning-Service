export const CAPTION_INTERVAL_MS = 300; // How often to send captions
export const PACKET_DURATION_MS = 100; // Each audio packet represents 100ms
// export const MAX_USAGE_MS = 60000; // 60 seconds max usage
export const MAX_USAGE_MS = 5000; // 5 seconds max usage
export const PORT = process.env.PORT || 3000;
export const WS_PORT = process.env.WS_PORT || 3001; 