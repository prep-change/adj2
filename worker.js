onmessage = function (e) {
  const { input, baseTargets, maxTry } = e.data;

  const denominations = [10000, 5000, 1000, 500, 100, 50, 10, 5, 1];

  function findOptimalAdjustment(input, baseTargets, maxTry = 15) {
    let best = null;

    for (let t = 0; t <= maxTry; t++) {
      const patterns = generateAdjustmentPatterns(baseTargets, t);
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

        const 補填和 = totalCoins(combo);
        const total = shortageCount + 補填和;

        if (!best || total < best.total) {
          best = { newTargets, shortage, shortageCount, shortageTotal, combo, 補填和, total };
        }
      }
    }

    return best;
  }

  function generateAdjustmentPatterns(baseTargets, extraCount) {
    if (extraCount === 0) return [Object.assign({}, baseTargets)];
    const patterns = [];
    const denoms = Object.keys(baseTargets).map(Number);

    function backtrack(i, remaining, current) {
      if (i === denoms.length) {
        if (remaining === 0) patterns.push({ ...current });
        return;
      }
      const denom = denoms[i];
      for (let add = 0; add <= remaining; add++) {
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
              totalCoins(newCombo) < totalCoins(dp[newAmount])
            ) {
              dp[newAmount] = newCombo;
            }
          }
        }
      }
    }

    return dp[targetAmount];
  }

  function totalCoins(combo) {
    return Object.values(combo).reduce((sum, c) => sum + c, 0);
  }

  const result = findOptimalAdjustment(input, baseTargets, maxTry);
  postMessage(result);
};
