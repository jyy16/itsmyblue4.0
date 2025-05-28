export const TEST_TYPES = {
  BLUE_PURPLE: 'BLUE_PURPLE',
  BLUE_GREEN: 'BLUE_GREEN',
  GREEN_YELLOW: 'GREEN_YELLOW'
};

function shuffleTestSequence() {
  // 创建三组测试
  const testGroups = [
    [TEST_TYPES.BLUE_PURPLE, TEST_TYPES.BLUE_PURPLE],
    [TEST_TYPES.BLUE_GREEN, TEST_TYPES.BLUE_GREEN],
    [TEST_TYPES.GREEN_YELLOW, TEST_TYPES.GREEN_YELLOW]
  ];
  
  // 随机打乱顺序
  for (let i = testGroups.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [testGroups[i], testGroups[j]] = [testGroups[j], testGroups[i]];
  }
  
  // 展平数组
  return testGroups.flat();
}

export const testSequence = shuffleTestSequence();
