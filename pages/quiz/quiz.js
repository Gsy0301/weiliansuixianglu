// quiz.js
Page({
  data: {
    currentStep: 1, // 1: 录入参考答案, 2: 录入用户答案, 3: 查看结果
    correctAnswers: {}, // 参考答案对象 {0: 'A', 1: 'B', ...}
    userAnswers: {}, // 用户答案对象 {0: 'A', 1: 'B', ...}
    totalQuestions: 0, // 总题数
    correctCount: 0, // 正确题数
    wrongQuestions: [], // 错题数组
    isAnswering: false, // 是否正在录入参考答案
    currentQuestionIndex: 0, // 当前题目索引
    questionList: [], // 参考答案录入时的题目列表
    userQuestionList: [], // 用户作答时的题目列表
    accuracy: 0, // 正确率百分比
    scrollIntoView: 'q-0', // 自动滚动定位id
    questionOverview: [], // 题目总览数据
    incompleteQuestions: [], // 未完成的题目列表
    showAllOverview: false, // 是否展开题目总览
  },

  onLoad() {
    this.setData({
      currentStep: 1,
      correctAnswers: {},
      userAnswers: {},
      totalQuestions: 0,
      correctCount: 0,
      wrongQuestions: [],
      isAnswering: true,
      currentQuestionIndex: 0,
      questionList: [{ index: 0, answer: '' }],
      userQuestionList: [],
      accuracy: 0,
      scrollIntoView: 'q-0',
      questionOverview: [],
      incompleteQuestions: [],
      showAllOverview: false
    })
  },

  // 选择参考答案
  selectCorrectAnswer(e) {
    const answer = e.currentTarget.dataset.answer
    const questionIndex = parseInt(e.currentTarget.dataset.index)
    
    if (this.data.isAnswering) {
      // 录入参考答案阶段：一次性新增5题并自动滚动
      const correctAnswers = { ...this.data.correctAnswers }
      correctAnswers[questionIndex] = answer

      let questionList = this.data.questionList.slice()
      
      // 更新当前题目的答案
      const existingIdx = questionList.findIndex(q => q.index === questionIndex)
      if (existingIdx >= 0) {
        questionList[existingIdx] = { index: questionIndex, answer }
      } else {
        questionList.push({ index: questionIndex, answer })
      }

      // 如果点击的是当前最后一题，则新增5题
      const currentLast = questionList.length ? questionList[questionList.length - 1].index : -1
      if (questionIndex >= currentLast) {
        const toAdd = Math.min(5, 150 - (currentLast + 1))
        for (let i = 1; i <= toAdd; i++) {
          const idx = currentLast + i
          if (idx <= 149) {
            questionList.push({ index: idx, answer: correctAnswers[idx] || '' })
          }
        }
      }

      const scrollTarget = questionList.length ? questionList[questionList.length - 1].index : questionIndex
      
      // 延迟设置scrollIntoView，确保DOM更新完成
      this.setData({
        correctAnswers: correctAnswers,
        questionList: questionList,
        currentQuestionIndex: scrollTarget
      })
      
      // 延迟触发滚动
      setTimeout(() => {
        this.setData({
          scrollIntoView: `q-${scrollTarget}`
        })
      }, 100)
      
      // 更新题目总览
      this.generateQuestionOverview()
    } else {
      // 录入用户答案阶段
      const userAnswers = { ...this.data.userAnswers }
      userAnswers[questionIndex] = answer
      // 同步更新用户作答渲染列表
      const userQuestionList = this.data.userQuestionList.map(q => q.index === questionIndex ? { ...q, answer } : q)
      this.setData({
        userAnswers: userAnswers,
        userQuestionList: userQuestionList
      })
      
      // 更新题目总览
      this.generateQuestionOverview()
    }
  },

  // 完成参考答案录入
  finishCorrectAnswers() {
    // 更新题目总览
    this.generateQuestionOverview()
    
    // 检查是否有未完成的题目
    if (this.data.incompleteQuestions.length > 0) {
      wx.showModal({
        title: '提示',
        content: `还有题目未完成：第${this.data.incompleteQuestions.join('、')}题`,
        showCancel: true,
        cancelText: '继续录入',
        confirmText: '强制完成',
        success: (res) => {
          if (res.confirm) {
            this.proceedToUserAnswers()
          }
        }
      })
      return
    }
    
    this.proceedToUserAnswers()
  },

  // 进入用户答案录入阶段
  proceedToUserAnswers() {
    // 获取所有有答案的题目索引（数字升序）
    const correctAnswers = this.data.correctAnswers
    const validIndices = Object.keys(correctAnswers)
      .map(k => parseInt(k))
      .filter(k => correctAnswers[k] !== '')
      .sort((a, b) => a - b)
    
    if (validIndices.length === 0) {
      wx.showToast({
        title: '请至少录入一题答案',
        icon: 'none'
      })
      return
    }
    
    // 创建用户答案对象与渲染列表
    const userAnswers = {}
    const userQuestionList = validIndices.map(idx => {
      userAnswers[idx] = ''
      return { index: idx, answer: '' }
    })
    
    this.setData({
      isAnswering: false,
      currentStep: 2,
      totalQuestions: validIndices.length,
      userAnswers: userAnswers,
      userQuestionList: userQuestionList
    })
    
    // 生成用户答案阶段的题目总览
    this.generateQuestionOverview()
  },

  // 完成用户答案录入
  finishUserAnswers() {
    // 更新题目总览
    this.generateQuestionOverview()
    
    // 检查是否有未完成的题目
    if (this.data.incompleteQuestions.length > 0) {
      wx.showModal({
        title: '提示',
        content: `还有题目未完成：第${this.data.incompleteQuestions.join('、')}题`,
        showCancel: true,
        cancelText: '继续录入',
        confirmText: '强制完成',
        success: (res) => {
          if (res.confirm) {
            this.proceedToResults()
          }
        }
      })
      return
    }
    
    this.proceedToResults()
  },

  // 进入结果页面
  proceedToResults() {
    const userAnswers = this.data.userAnswers
    const correctAnswers = this.data.correctAnswers
    
    // 计算正确率
    let correctCount = 0
    let wrongQuestions = []
    
    this.data.userQuestionList.forEach(({ index }) => {
      if (userAnswers[index] === correctAnswers[index]) {
        correctCount++
      } else {
        wrongQuestions.push({
          index: index + 1,
          userAnswer: userAnswers[index],
          correctAnswer: correctAnswers[index]
        })
      }
    })
    
    const total = this.data.userQuestionList.length || 1
    const accuracy = Math.round((correctCount / total) * 100)

    this.setData({
      currentStep: 3,
      correctCount: correctCount,
      wrongQuestions: wrongQuestions,
      totalQuestions: total,
      accuracy: accuracy
    })
  },

  // 重新开始
  restart() {
    this.setData({
      currentStep: 1,
      correctAnswers: {},
      userAnswers: {},
      totalQuestions: 0,
      correctCount: 0,
      wrongQuestions: [],
      isAnswering: true,
      currentQuestionIndex: 0,
      questionList: [{ index: 0, answer: '' }],
      userQuestionList: [],
      accuracy: 0,
      scrollIntoView: 'q-0',
      questionOverview: [],
      incompleteQuestions: [],
      showAllOverview: false
    })
  },

  // 切换题目总览展开/收起
  toggleOverview() {
    this.setData({ showAllOverview: !this.data.showAllOverview })
  },

  // 全屏查看题目总览
  showFullOverview() {
    this.setData({ showAllOverview: true })
  },

  // 关闭全屏总览
  closeFullOverview() {
    this.setData({ showAllOverview: false })
  },

  // 生成题目总览
  generateQuestionOverview() {
    const questionOverview = []
    const incompleteQuestions = []
    
    if (this.data.isAnswering) {
      // 录入参考答案阶段
      const correctAnswers = this.data.correctAnswers
      const maxIndex = Math.max(...Object.keys(correctAnswers).map(k => parseInt(k)), 0)
      
      for (let i = 0; i <= maxIndex; i++) {
        const hasAnswer = correctAnswers[i] && correctAnswers[i] !== ''
        questionOverview.push({
          index: i,
          status: hasAnswer ? 'answered' : 'empty'
        })
        if (!hasAnswer) {
          incompleteQuestions.push(i + 1)
        }
      }
    } else {
      // 录入用户答案阶段
      const userAnswers = this.data.userAnswers
      const correctAnswers = this.data.correctAnswers
      
      Object.keys(userAnswers).forEach(key => {
        const index = parseInt(key)
        const userAnswer = userAnswers[key]
        const correctAnswer = correctAnswers[key]
        
        let status = 'empty'
        if (userAnswer) {
          status = userAnswer === correctAnswer ? 'correct' : 'wrong'
        }
        
        questionOverview.push({
          index: index,
          status: status
        })
        
        if (!userAnswer) {
          incompleteQuestions.push(index + 1)
        }
      })
    }
    
    this.setData({
      questionOverview: questionOverview,
      incompleteQuestions: incompleteQuestions
    })
  },

  // 返回首页
  goBack() {
    wx.navigateBack()
  }
})
