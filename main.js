const denominations = [10000, 5000, 1000, 500, 100, 50, 10, 5, 1];
const baseTargets = {
  10000: 0,
  5000: 15,
  1000: 42,
  500: 50,
  100: 100,
  50: 50,
  10: 100,
  5: 16,
  1: 20
};

let latestInput = {};

const inputArea = document.getElementById("input-area");
denominations.forEach(denom => {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center space-x-2 min-w-0";
  wrapper.innerHTML = `
    <label class="w-20 font-medium">${denom}円</label>
    <input id="input${denom}" type="number" min="0" value="" class="flex-1 p-1 border rounded w-full" />
  `;
  inputArea.appendChild(wrapper);
});

function calculateShortage() {
  const input = {};
  denominations.forEach(denom => {
    input[denom] = parseInt(document.getElementById(`input${denom}`).value || "0", 10);
  });
  latestInput = input;

  let resultText = `【調整前不足金種】\n`;
  let total = 0;
  for (let denom of denominations) {
    const shortage = Math.max(0, baseTargets[denom] - input[denom]);
    if (shortage > 0) {
      resultText += `${denom}円×${shortage}枚 = ${denom * shortage}円\n`;
      total += denom * shortage;
    }
  }
  resultText += `不足合計　${total.toLocaleString()}円`;

  document.getElementById("shortageResult").innerText = resultText;
  document.getElementById("adjustmentResult").innerText = "";
}

function adjustShortage() {
  if (!latestInput || Object.keys(latestInput).length === 0) {
    document.getElementById("adjustmentResult").innerText = "※ 先に「不足を計算する」を押してください。";
    return;
  }

  const input = latestInput;
  const best = findOptimalAdjustment(input, baseTargets, 10);
  if (!best) {
    document.getElementById("adjustmentResult").innerText = "※ 補填できませんでした。";
    return;
  }

  let resultText = `【調整後不足金種】\n`;
  const { shortage, shortageTotal, combo } = best;

  for (let denom of denominations) {
    if (shortage[denom]) {
      resultText += `${denom}円×${shortage[denom]}枚 = ${denom * shortage[denom]}円\n`;
    }
  }
  resultText += `不足合計　${shortageTotal.toLocaleString()}円\n\n`;

  resultText += `【補填内訳】\n`;
  let 補填合計 = 0;
  for (let denom of denominations) {
    if (combo[denom]) {
      const amount = denom * combo[denom];
      補填合計 += amount;
      resultText += `${denom}円×${combo[denom]}枚 = ${amount.toLocaleString()}円\n`;
    }
  }
  resultText += `補填合計　${補填合計.toLocaleString()}円`;

  document.getElementById("adjustmentResult").innerText = resultText;
}
