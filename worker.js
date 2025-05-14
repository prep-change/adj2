onmessage = function (e) {
  const { stock, targets } = e.data;
  const denominations = [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1];
  const maxTry = 2;

  const shortages = targets.map((t, i) => Math.max(0, t - stock[i]));
  const shortageAmount = shortages.reduce((sum, n, i) => sum + n * denominations[i], 0);

  let best = null;
  let bestTotal = Infinity;

  function* generateAdjustments(index = 0, current = [...shortages]) {
    if (index >= shortages.length) {
      yield current;
      return;
    }
    for (let add = 0; add <= maxTry; add++) {
      current[index] = shortages[index] + add;
      yield* generateAdjustments(index + 1, current);
    }
  }

  for (const adjusted of generateAdjustments()) {
    const addAmount = adjusted.reduce((sum, n, i) => sum + n * denominations[i], 0);
    const need = addAmount;
    const items = [];

    for (let i = 0; i < denominations.length; i++) {
      for (let j = 0; j < stock[i]; j++) {
        items.push(denominations[i]);
      }
    }

    const dp = Array(need + 1).fill(null);
    dp[0] = [];

    for (const item of items) {
      for (let j = need; j >= item; j--) {
        if (dp[j - item]) {
          const candidate = [...dp[j - item], item];
          if (!dp[j] || candidate.length < dp[j].length) {
            dp[j] = candidate;
          }
        }
      }
    }

    const used = dp[need];
    if (!used) continue;

    const usedCounts = denominations.map(d => used.filter(x => x === d).length);
    const total = adjusted.reduce((a, b) => a + b, 0) + used.length;

    if (total < bestTotal) {
      bestTotal = total;
      best = { adjusted, usedCounts };
    }
  }

  if (!best) {
    postMessage({ result: '調整に失敗しました。' });
    return;
  }

  const adjustedText = best.adjusted
    .map((count, i) => count > shortages[i] ? `${denominations[i]}円 × ${count}枚（+${count - shortages[i]}）` : count > 0 ? `${denominations[i]}円 × ${count}枚` : null)
    .filter(Boolean)
    .join('\n');

  const usedText = best.usedCounts
    .map((count, i) => count > 0 ? `${denominations[i]}円 × ${count}枚` : null)
    .filter(Boolean)
    .join('\n');

  postMessage({
    result: `▼ 不足金種\n${adjustedText}\n\n▼ 補填に使用\n${usedText}`
  });
};
