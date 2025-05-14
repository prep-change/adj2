const denominations = [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1];
const goalAmount = 155600;

function createInputs() {
  const form = document.getElementById("cash-form");
  denominations.forEach(denom => {
    const label = document.createElement("label");
    label.className = "flex items-center gap-2";
    label.innerHTML = `<span>${denom}円:</span><input type="number" id="input-${denom}" class="border p-1 w-20" min="0" value="0">`;
    form.appendChild(label);
  });
}

function getInputs() {
  return denominations.map(denom => parseInt(document.getElementById(`input-${denom}`).value) || 0);
}

function displayResult(text) {
  document.getElementById("result").textContent = text;
}

function showLoading(show) {
  document.getElementById("loading").classList.toggle("hidden", !show);
}

function sendToWorker(type) {
  const inputs = getInputs();
  showLoading(true);
  displayResult("");
  window.changeWorker.onmessage = (e) => {
    showLoading(false);
    displayResult(e.data);
  };
  window.changeWorker.postMessage({ type, inputs, goalAmount });
}

document.getElementById("calculate").onclick = () => sendToWorker("calculate");
document.getElementById("adjust").onclick = () => sendToWorker("adjust");

createInputs();
