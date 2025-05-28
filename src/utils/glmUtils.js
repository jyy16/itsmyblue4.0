export function fitSigmoid(hues, responses, polarity, tailProbability = 0.2, center_hue, hue_min, hue_max) {
  // ================== 修改点 1/5 ==================
  // 新的色调范围：紫色(300)到蓝色(240)
  const CENTER_HUE = center_hue;   // 原值：180（蓝绿中心）
  const HUE_MIN = hue_min;      // 原值：120
  const HUE_MAX = hue_max;      // 原值：240

  // 初始化参数保持不变
  let a = 0.2; // Initial guess for a
  let b = 0;   // Initial guess for b
  const priorA = { mean: 0.2, sd: 0.5 };
  const priorB = { mean: 0, sd: 30 };

  // ================== 保持不变的辅助函数 ==================
  const sigmoid = (x) => {
    if (x >= 0) return 1 / (1 + Math.exp(-x));
    else return Math.exp(x) / (1 + Math.exp(x));
  };

  const logSigmoid = (x) => {
    if (x >= 0) return -Math.log1p(Math.exp(-x));
    else return x - Math.log1p(Math.exp(x));
  };

  // ================== 修改点 2/5 ==================
  // 更新所有 (hue - 180 + b) 为 (hue - CENTER_HUE + b)
  const logLikelihood = (a, b) => {
    return hues.reduce((sum, hue, i) => {
      const z = a * (hue - CENTER_HUE + b);
      return sum + (responses[i] ? logSigmoid(z) : logSigmoid(-z));
    }, 0);
  };

  // ================== 牛顿法迭代 ==================
  for (let iter = 0; iter < 20; iter++) {
    const ll = logLikelihood(a, b);
    
    // 梯度计算（更新中心点）
    const grad_a =
      hues.reduce((sum, hue, i) => {
        const z = a * (hue - CENTER_HUE + b);  // 修改点 3/5
        const s = sigmoid(z);
        return sum + (responses[i] - s) * (hue - CENTER_HUE + b);  // 中心点修改
      }, 0) - (a - priorA.mean) / priorA.sd ** 2;

    const grad_b =
      hues.reduce((sum, hue, i) => {
        const z = a * (hue - CENTER_HUE + b);  // 中心点修改
        const s = sigmoid(z);
        return sum + (responses[i] - s) * a;
      }, 0) - (b - priorB.mean) / priorB.sd ** 2;

    // 海森矩阵计算（更新中心点）
    const hess_aa =
      hues.reduce((sum, hue) => {
        const z = a * (hue - CENTER_HUE + b);  // 中心点修改
        const s = sigmoid(z);
        return sum - s * (1 - s) * (hue - CENTER_HUE + b) ** 2;  // 中心点修改
      }, 0) - 1 / priorA.sd ** 2;

    const hess_ab = hues.reduce((sum, hue) => {
      const z = a * (hue - CENTER_HUE + b);  // 中心点修改
      const s = sigmoid(z);
      return sum - s * (1 - s) * a * (hue - CENTER_HUE + b);  // 中心点修改
    }, 0);

    const hess_bb =
      hues.reduce((sum, hue) => {
        const z = a * (hue - CENTER_HUE + b);  // 中心点修改
        const s = sigmoid(z);
        return sum - s * (1 - s) * a ** 2;
      }, 0) - 1 / priorB.sd ** 2;

    // 参数更新逻辑保持不变
    const det = hess_aa * hess_bb - hess_ab ** 2;
    const delta_a = (hess_bb * grad_a - hess_ab * grad_b) / det;
    const delta_b = (hess_aa * grad_b - hess_ab * grad_a) / det;

    // 回溯直线搜索
    let stepSize = 1;
    let maxIter = 10;
    for (let i = 0; i < maxIter; i++) {
      const newA = Math.max(0.01, a - stepSize * delta_a);
      const newB = b - stepSize * delta_b;
      const newLL = logLikelihood(newA, newB);
      if (newLL > ll) break;
      stepSize *= 0.5;
    }

    a = Math.max(0.01, a - stepSize * delta_a);
    b = b - stepSize * delta_b;

    if (Math.abs(delta_a) < 1e-6 && Math.abs(delta_b) < 1e-6) break;
  }

  // ================== 修改点 4-5/5 ==================
  // 生成新刺激值（更新中心点和范围限制）
  if (polarity == 0) {
    polarity = Math.random() < 0.5 ? 1 : -1;
  }
  let percentile = polarity > 0 ? tailProbability : 1 - tailProbability;
  let newProbe = CENTER_HUE - b + Math.log(percentile / (1 - percentile)) / a;  // 原180改为CENTER_HUE
  
  // 添加随机扰动并限制到新范围
  newProbe += Math.random() * 2 - 1;  // ±1随机扰动
  newProbe = Math.max(HUE_MIN, Math.min(newProbe, HUE_MAX));  // 原[120,240]改为[240,300]

  return { a, b, polarity, newProbe };
}