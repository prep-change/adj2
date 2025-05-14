onmessage = function (e) {
  const { input, baseTargets, tryStart, tryEnd } = e.data;
  const denominations = [10000, 5000, 1000, 500, 100, 50, 10, 5, 1];

  let best = null;

  for (let t = tryStart; t < tryEnd; t++) {
    const patterns = generatePatterns(baseTargets, Math.floor(t));
    for (let newTargets of patterns) {
      const shortage = {};
      let shortageTotal = 0, shortageCount = 0;

      for (let denom of denominations) {
        const need = newTargets[denom] || 0;
        const lack = Math.max(0, need - input[denom]);
        if (lack > 0) {
          shortage[denom] = lack;
          shortageTotal += denom * lack;
          shortageCount += lack;
        }
      }

      const usableCoins = denominations.map(denom => {
        const adjustedInput = input[denom] + (shortage[denom] || 0);
        const usable = adjustedInput - (newTargets[denom] || 0);
        return [denom, usable];
      }).filter(([_, count]) => count > 0);

      const combo = knapsack(usableCoins, shortageTotal);
      if (!combo) continue;

      const totalCoins = Object.values(combo).reduce((a, b) => a + b, 0);
      const total = shortageCount + totalCoins;

      if (!best || total < best.total) {
        best = { newTargets, shortage, shortageCount, shortageTotal, combo, total };
      }
    }
  }

  postMessage(best);

  function generatePatterns(baseTargets, extraCount) {
    if (extraCount === 0) return [Object.assign({}, baseTargets)];
    const patterns = [];
    const denoms = Object.keys(baseTargets).map(Number);

    function backtrack(i, remaining, current) {
      if (i === denoms.length) {
        if (remaining === 0) patterns.push({ ...current });
        return;
      }
      const denom = denoms[i];
      const maxAdd = denom === 5000 ? Math.min(1, remaining) : remaining;
      for (let add = 0; add <= maxAdd; add++) {
        current[denom] = baseTargets[denom] + add;
        backtrack(i + 1, remaining - add, current);
      }
    }

    backtrack(0, extraCount, {});
    return patterns;
  }

  function knapsack(usableCoins, targetAmount) {
    const dp = Array(targetAmount + 1).fill(null);
    dp[0] = {};

    for (let [denom, count] of usableCoins) {
      for (let a = targetAmount; a >= 0; a--) {
        if (dp[a] !== null) {
          for (let k = 1; k <= count; k++) {
            const newAmount = a + denom * k;
            if (newAmount > targetAmount) break;
            const newCombo = { ...dp[a] };
            newCombo[denom] = (newCombo[denom] || 0) + k;

            if (
              dp[newAmount] === null ||
              Object.values(newCombo).reduce((s, c) => s + c, 0) < Object.values(dp[newAmount]).reduce((s, c) => s + c, 0)
            ) {
              dp[newAmount] = newCombo;
            }
          }
        }
      }
    }

    return dp[targetAmount];
  }
};
