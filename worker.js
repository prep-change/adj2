onmessage = function(e) {
  const { stock, shortages, targetAmount } = e.data;

  const denominations = [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1];
  const shortageDenoms = Object.keys(shortages).map(Number);

  let best = null;

  function* generate() {
    const limits = shortageDenoms.map(d => shortages[d] + 1);
    const counters = Array(shortageDenoms.length).fill(0);

    while (true) {
      yield [...counters];
      let i = counters.length - 1;
      while (i >= 0) {
        counters[i]++;
        if (counters[i] < limits[i]) break;
        counters[i] = 0;
        i--;
      }
      if (i < 0) break;
    }
  }

  for (const added of generate()) {
    const tempStock = { ...stock };
    shortageDenoms.forEach((d, i) => {
      tempStock[d] += added[i];
    });

    let remaining = targetAmount;
    const usage = {};
    denominations.forEach(denom => {
      const maxUse = Math.min(Math.floor(remaining / denom), tempStock[denom]);
      usage[denom] = maxUse;
      remaining -= denom * maxUse;
    });

    if (remaining === 0) {
      const usedOver = {};
      let total = 0;
      shortageDenoms.forEach(d => {
        const extra = usage[d] - stock[d];
        if (extra > 0) usedOver[d] = extra;
      });
      total = Object.values(usedOver).reduce((a, b) => a + b, 0);
      if (!best || total < best.total) {
        best = { result: usage, compensations: usedOver, total };
      }
    }
  }

  if (best) {
    postMessage({ result: best.result, compensations: best.compensations });
  }
};
