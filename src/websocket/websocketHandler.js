import { WebSocketServer } from 'ws';
import { CAPTION_INTERVAL_MS, PACKET_DURATION_MS, MAX_USAGE_MS, WS_PORT } from '../config/constants.js';
import { usageService } from '../services/usageService.js';
import { captioningService } from '../services/captioningService.js';
import http from 'http';

class WebSocketHandler {
  constructor() {
    // Create HTTP server
    this.server = http.createServer();
    
    // Create WebSocket server attached to HTTP server
    this.wss = new WebSocketServer({ server: this.server });
    
    // Start listening
    this.server.listen(WS_PORT, () => {
      console.log(`WebSocket server is running on port ${WS_PORT}`);
    });

    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const clientId = req.headers['x-client-id'];
      
      if (!clientId) {
        ws.close(4000, 'Client ID required');
        return;
      }

      // Check initial usage before accepting connection
      const currentUsage = usageService.getUsage(clientId);
      if (currentUsage >= MAX_USAGE_MS) {
        ws.close(4001, 'Usage limit exceeded');
        return;
      }

      console.log(`Client connected with ID: ${clientId}. Current usage: ${currentUsage}ms`);
      
      let captionInterval = null;
      let packetsReceived = 0;

      ws.on('message', (message) => {
        packetsReceived++;
        const newUsage = currentUsage + (packetsReceived * PACKET_DURATION_MS);
        
        // Check if this packet would exceed the limit
        if (newUsage > MAX_USAGE_MS) {
          console.log(`Client ${clientId} would exceed usage limit. Current: ${usageService.getUsage(clientId)}ms`);
          ws.close(4001, 'Usage limit exceeded');
          return;
        }

        // Update usage only if we haven't exceeded the limit
        usageService.addUsage(clientId, PACKET_DURATION_MS);
        
        console.log(`Client ${clientId} usage: ${usageService.getUsage(clientId)}ms (Packet #${packetsReceived})`);

        // Start caption generation if not already started
        if (!captionInterval) {
          captionInterval = setInterval(() => {
            if (ws.readyState === ws.OPEN) {
              const caption = captioningService.generateCaption();
              ws.send(JSON.stringify({ 
                caption,
                stats: {
                  packetsReceived,
                  totalUsageMs: usageService.getUsage(clientId),
                  remainingMs: MAX_USAGE_MS - usageService.getUsage(clientId)
                }
              }));
            }
          }, CAPTION_INTERVAL_MS);
        }
      });

      ws.on('close', () => {
        console.log(`Client ${clientId} disconnected. Final usage: ${usageService.getUsage(clientId)}ms (${packetsReceived} packets)`);
        if (captionInterval) {
          clearInterval(captionInterval);
        }
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        if (captionInterval) {
          clearInterval(captionInterval);
        }
      });
    });
  }
}

export const websocketHandler = new WebSocketHandler();