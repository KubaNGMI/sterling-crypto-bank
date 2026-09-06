// This is a mock. Real work will eventually hit a real backend with real
// latency; until then we fake it so loading states, spinners, and disabled
// buttons all get exercised and the panel feels like it's talking to a server.
export function mockLatency(min = 450, max = 1200) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
