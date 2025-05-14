const denominations = [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1];
const targetCounts = [5, 4, 0, 10, 20, 100, 40, 50, 20, 50];
const inputArea = document.getElementById('input-area');
const targetArea = document.getElementById('target-area');
const output = document.getElementById('output');
const status = document.getElementById('status');
const calcBtn = document.getElementById('calc-btn');
const adjustBtn = document.getElementById('adjust-btn');

let worker = new Worker('worker.js');

denominations.forEach((denom, i) => {
  inputArea.innerHTML += `
    <div class="flex items-center gap-2">
      <label class="w-16">${denom}円</label>
      <input id="input-${i}" type="number" min="0" value="0" class="w-full px-2 py-1 border rounded" />
    </div>
  `;
  targetArea.innerHTML += `
    <div class="flex items-center gap-2">
      <label class="w-16">${denom}円</label>
      <input id="target-${i}" type="number" min="0" value="${targetCounts[i]}" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
    </div>
  `;
});

function getValues() {
  const stock = denominations.map((_, i) => parseInt(document.getElementById(`input-${i}`).value || 0));
  const targets = targetCounts;
  return { stock, targets };
}

function showStatus(text) {
  status.textContent = text;
}

function showOutput(text) {
  output.textContent = text;
}

calcBtn.onclick = () => {
  const { stock, targets } = getValues();
  const shortages = targets.map((t, i) => Math.max(0, t - stock[i]));
  const shortageText = shortages
    .map((count, i) => count > 0 ? `${denominations[i]}円 × ${count}枚` : null)
    .filter(Boolean)
    .join('\n');
  showOutput(shortageText || '不足はありません');
};

adjustBtn.onclick = () => {
  const { stock, targets } = getValues();
  showStatus('調整中です…');
  showOutput('');
  worker.postMessage({ stock, targets });
};

worker.onmessage = (e) => {
  const { result } = e.data;
  showStatus('');
  showOutput(result);
};
