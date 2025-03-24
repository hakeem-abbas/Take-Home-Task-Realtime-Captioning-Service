class UsageService {
  constructor() {
    this.usageMap = new Map(); // Store client usage in memory
    this.packetCountMap = new Map(); // Track number of packets per client
  }

  addUsage(clientId, packetDurationMs) {
    // Update packet count
    const currentPackets = this.packetCountMap.get(clientId) || 0;
    const newPacketCount = currentPackets + 1;
    this.packetCountMap.set(clientId, newPacketCount);
    
    // Calculate total usage based on number of packets
    const totalUsageMs = newPacketCount * packetDurationMs;
    this.usageMap.set(clientId, totalUsageMs);
    
    return totalUsageMs;
  }

  getUsage(clientId) {
    return this.usageMap.get(clientId) || 0;
  }

  getPacketCount(clientId) {
    return this.packetCountMap.get(clientId) || 0;
  }

  hasExceededLimit(clientId, maxUsageMs) {
    return this.getUsage(clientId) >= maxUsageMs;
  }

  // Get detailed usage statistics
  getUsageStats(clientId) {
    const packetCount = this.getPacketCount(clientId);
    const usageMs = this.getUsage(clientId);
    
    return {
      clientId,
      packetCount,
      usageMs,
      usageSeconds: usageMs / 1000
    };
  }
}

export const usageService = new UsageService(); 