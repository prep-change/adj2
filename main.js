const denominations = [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1];
const targetAmount = 155600;

document.addEventListener("DOMContentLoaded", () => {
  const stockInputs = document.getElementById("stockInputs");
  const result = document.getElementById("result");
  const shortages = document.getElementById("shortages");
  const compensations = document.getElementById("compensations");
  const status = document.getElementById("status");

  const inputs = {};

  denominations.forEach(denom => {
    const stockInput = document.createElement("input");
    stockInput.type = "number";
    stockInput.min = "0";
    stockInput.value = "0";
    stockInput.className = "w-full p-1 border rounded";
    stockInputs.appendChild(stockInput);
    inputs[denom] = stockInput;

    const resultDisplay = document.createElement("div");
    resultDisplay.textContent = `${denom}円: 0枚`;
    resultDisplay.id = `result-${denom}`;
    result.appendChild(resultDisplay);
  });

  document.getElementById("calculateBtn").addEventListener("click", () => {
    status.textContent = "";
    shortages.textContent = "";
    compensations.textContent = "";

    const stock = {};
    denominations.forEach(denom => {
      stock[denom] = parseInt(inputs[denom].value) || 0;
    });

    const result = getInitialUsage(stock);
    updateResultDisplay(result);
    const shortageInfo = getShortages(result, stock);
    displayShortages(shortageInfo);
  });

  document.getElementById("adjustBtn").addEventListener("click", async () => {
    status.textContent = "調整中です…";
    shortages.textContent = "";
    compensations.textContent = "";

    const stock = {};
    denominations.forEach(denom => {
      stock[denom] = parseInt(inputs[denom].value) || 0;
    });

    const initialUsage = getInitialUsage(stock);
    const shortageInfo = getShortages(initialUsage, stock);

    const worker = new Worker("worker.js");
    worker.postMessage({ stock, shortages: shortageInfo, targetAmount });

    worker.onmessage = (e) => {
      const { result, compensations: comp } = e.data;

      updateResultDisplay(result);
      displayShortages(getShortages(result, stock));
      displayCompensations(comp);
      status.textContent = "";
      worker.terminate();
    };
  });

  function getInitialUsage(stock) {
    let remaining = targetAmount;
    const usage = {};

    denominations.forEach(denom => {
      const maxUse = Math.min(Math.floor(remaining / denom), stock[denom]);
      usage[denom] = maxUse;
      remaining -= denom * maxUse;
    });

    return usage;
  }

  function getShortages(usage, stock) {
    const shortages = {};
    denominations.forEach(denom => {
      const diff = usage[denom] - stock[denom];
      if (diff > 0) shortages[denom] = diff;
    });
    return shortages;
  }

  function updateResultDisplay(usage) {
    denominations.forEach(denom => {
      document.getElementById(`result-${denom}`).textContent = `${denom}円: ${usage[denom] || 0}枚`;
    });
  }

  function displayShortages(shortagesData) {
    shortages.textContent = "";
    Object.entries(shortagesData).forEach(([denom, count]) => {
      shortages.textContent += `不足: ${denom}円 × ${count}枚\n`;
    });
  }

  function displayCompensations(compData) {
    compensations.textContent = "";
    Object.entries(compData).forEach(([denom, count]) => {
      compensations.textContent += `補填: ${denom}円 × ${count}枚\n`;
    });
  }
});
