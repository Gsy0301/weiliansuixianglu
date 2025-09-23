// coin-divination.js
Page({
  data: {
    coins: ['?', '?', '?'],
    isThrowing: false,
    hasThrown: false,
    results: []
  },

  onLoad() {
    console.log('金钱卦页面加载');
  },

  toggleThrowing() {
    if (this.data.isThrowing) return;
    
    // 如果已经投掷过，重置状态
    if (this.data.hasThrown) {
      this.setData({
        coins: ['?', '?', '?'],
        hasThrown: false,
        results: []
      });
    }
    
    this.setData({
      isThrowing: true
    });

    // 开始投掷动画
    this.startThrowingAnimation();
  },

  startThrowingAnimation() {
    const interval = setInterval(() => {
      const randomCoins = this.generateRandomCoins();
      this.setData({
        coins: randomCoins
      });
    }, 50);

    // 保存定时器ID，用于停止
    this.throwingInterval = interval;
  },

  stopThrowing() {
    if (!this.data.isThrowing) return;

    // 清除投掷动画
    if (this.throwingInterval) {
      clearInterval(this.throwingInterval);
      this.throwingInterval = null;
    }

    // 生成最终结果
    const finalResults = this.generateRandomCoins();
    this.setData({
      isThrowing: false,
      hasThrown: true,
      coins: finalResults,
      results: finalResults
    });
  },

  generateRandomCoins() {
    const coinSymbols = ['yang', 'yin'];
    return [
      coinSymbols[Math.floor(Math.random() * 2)],
      coinSymbols[Math.floor(Math.random() * 2)],
      coinSymbols[Math.floor(Math.random() * 2)]
    ];
  },

});
