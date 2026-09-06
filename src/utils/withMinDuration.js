// Runs `work` but never resolves faster than `ms`. Used to give the app a
// calm, deliberate beat on load and on money actions — a finance surface that
// settles rather than flashing. Never *slower* than reality; only a floor.
export async function withMinDuration(work, ms = 450) {
  const [result] = await Promise.all([
    Promise.resolve().then(work),
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
  return result;
}
