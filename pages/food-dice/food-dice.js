Page({
  data: {
    rolling: false,
    currentDish: '来点好吃的～',
    pool: [
      { name: '热干面', emoji: '🍜' },
      { name: '黄焖鸡米饭', emoji: '🍛' },
      { name: '螺狮粉', emoji: '🌀' },
      { name: '辣椒炒肉', emoji: '🌶️🥩' },
      { name: '牛肉拉面', emoji: '🥩🍜' },
      { name: '炒河粉', emoji: '🍝' },
      { name: '私家小厨', emoji: '🍽️' },
      { name: '烤鸭', emoji: '🦆' },
      { name: '胡辣汤', emoji: '🥣' },
      { name: '花小小', emoji: '🌸' },
      { name: '大米套餐', emoji: '🍱' },
      { name: '猪米', emoji: '🐷🍚' },
      { name: '烤肉拌饭', emoji: '🍖🍚' },
      { name: '未来自选', emoji: '🛒🍱' },
      { name: '鸡排饭', emoji: '🍗🍚' },
      { name: '煎饼果子', emoji: '🫓' },
      { name: '刀削面', emoji: '🍜' },
      { name: '汉堡', emoji: '🍔' },
      { name: '泡面', emoji: '🍜' },
      { name: '新疆炒米粉', emoji: '🍝' },
      { name: '榕树自选', emoji: '🌳🍱' },
      { name: '掉渣饼', emoji: '🫓' },
      { name: '饭团', emoji: '🍙' },
      { name: '三明治', emoji: '🥪' },
    ]
  },


  roll() {
    if (!this._timer) {
      // start
      this.setData({ rolling: true })
      const interval = 70
      this._timer = setInterval(() => {
        const idx = Math.floor(Math.random() * this.data.pool.length)
        this.setData({ currentDish: this.data.pool[idx].name })
      }, interval)
    } else {
      // stop
      clearInterval(this._timer)
      this._timer = null
      this.setData({ rolling: false })
    }
  },

  onUnload() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },

  // 保持简洁：不再维护标签与建议列表
})

