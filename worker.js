onmessage = function(e) {
  const { type, inputs, goalAmount } = e.data;

  function calculate() {
    let totalAmount = 0;
    const result = [];
    for (let i = 0; i < inputs.length; i++) {
      totalAmount += inputs[i] * denominations[i];
    }
    if (totalAmount === goalAmount) {
      result.push("目標金額通りです！");
      return result.join("\n");
    }
    result.push(`目標金額: ${goalAmount}`);
    result.push(`現在の合計: ${totalAmount}`);
    result.push("不足金額: " + (goalAmount - totalAmount));
    return result.join("\n");
  }

  function adjust() {
    const result = [];
    let totalAmount = 0;
    let adjustmentNeeded = goalAmount;

    const adjustment = inputs.map((count, index) => {
      totalAmount += count * denominations[index];
      return { denom: denominations[index], count };
    });

    if (totalAmount === goalAmount) {
      result.push("目標金額通りです！");
    } else if (totalAmount < goalAmount) {
      result.push("不足分を補填します:");
      let remaining = goalAmount - totalAmount;
      for (let i = 0; i < adjustment.length; i++) {
        if (remaining <= 0) break;
        const denom = adjustment[i].denom;
        const maxCount = Math.floor(remaining / denom);
        adjustment[i].count += maxCount;
        remaining -= denom * maxCount;
      }
      result.push("調整後: ");
      adjustment.forEach(item => result.push(`${item.denom}円 × ${item.count}`));
    } else {
      result.push("過剰な金額を削減します");
    }
    return result.join("\n");
  }

  let response;
  if (type === "calculate") {
    response = calculate();
  } else if (type === "adjust") {
    response = adjust();
  }

  postMessage(response);
};
