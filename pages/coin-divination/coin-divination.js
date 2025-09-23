// coin-divination.js
Page({
  data: {
    coins: ['?', '?', '?'],
    isThrowing: false,
    hasThrown: false,
    results: [],
    // 业务数据
    throwCount: 0,
    maxThrows: 6,
    lines: [], // 每爻记录：{ sum, lineType, isYang, isChanging, symbol }
    primaryHexagram: null, // { upperName, lowerName, name, lines }
    changedHexagram: null // { upperName, lowerName, name, lines } 或 null
  },

  onLoad() {
    console.log('金钱卦页面加载');
  },

  toggleThrowing() {
    // 如果正在投掷，则改为停止
    if (this.data.isThrowing) {
      this.stopThrowing();
      return;
    }

    // 若已完成六次投掷，提示是否重新开始
    if (this.data.throwCount >= this.data.maxThrows) {
      wx.showModal({
        title: '提示',
        content: '已完成六次投掷，是否重新开始？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.resetStateAndStart();
          }
        }
      });
      return;
    }

    // 如果之前完成过一轮（防御性判断），也提示
    if (this.data.hasThrown) {
      wx.showModal({
        title: '提示',
        content: '是否重新开始新一轮投掷？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.resetStateAndStart();
          }
        }
      });
      return;
    }

    this.setData({
      isThrowing: true
    });

    // 开始投掷动画
    this.startThrowingAnimation();
  },

  resetStateAndStart() {
    this.setData({
      coins: ['?', '?', '?'],
      hasThrown: false,
      results: [],
      throwCount: 0,
      lines: [],
      primaryHexagram: null,
      changedHexagram: null,
      isThrowing: true
    });
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

    // 生成最终结果并记录一爻
    const finalResults = this.generateRandomCoins();
    const sum = this.coinsToSum(finalResults);
    const lineRecord = this.sumToLine(sum);

    const newLines = this.data.lines.concat(lineRecord);
    const newThrowCount = this.data.throwCount + 1;

    const newState = {
      isThrowing: false,
      coins: finalResults,
      results: finalResults,
      throwCount: newThrowCount,
      lines: newLines
    };

    // 若达到六次，完成并分析卦象
    if (newThrowCount >= this.data.maxThrows) {
      const analysis = this.analyzeHexagrams(newLines);
      newState.hasThrown = true;
      newState.primaryHexagram = analysis.primaryHexagram;
      newState.changedHexagram = analysis.changedHexagram;
    }

    this.setData(newState);
  },

  generateRandomCoins() {
    const coinSymbols = ['yang', 'yin'];
    return [
      coinSymbols[Math.floor(Math.random() * 2)],
      coinSymbols[Math.floor(Math.random() * 2)],
      coinSymbols[Math.floor(Math.random() * 2)]
    ];
  },

  coinsToSum(coins) {
    // yang=3, yin=2
    return coins.reduce((acc, c) => acc + (c === 'yang' ? 3 : 2), 0);
  },

  sumToLine(sum) {
    // 6: 老阴 阴爻 变爻, 7: 少阳 阳爻 不变, 8: 少阴 阴爻 不变, 9: 老阳 阳爻 变爻
    let lineType = '';
    let isYang = false;
    let isChanging = false;
    if (sum === 6) { lineType = '老阴'; isYang = false; isChanging = true; }
    else if (sum === 7) { lineType = '少阳'; isYang = true; isChanging = false; }
    else if (sum === 8) { lineType = '少阴'; isYang = false; isChanging = false; }
    else if (sum === 9) { lineType = '老阳'; isYang = true; isChanging = true; }

    // 卦象符号：阳⚊（实线），阴⚋（中断线）；老阳加○，老阴加×
    const baseSymbol = isYang ? '⚊' : '⚋';
    let symbol = baseSymbol;
    if (sum === 9) symbol += ' ○';
    if (sum === 6) symbol += ' ×';

    return { sum, lineType, isYang, isChanging, symbol };
  },

  analyzeHexagrams(lines) {
    // lines 顺序：自下而上依次 push 的 6 爻
    const primaryBinary = lines.map(l => l.isYang ? 1 : 0); // [b0...b5] b0为初爻
    const changedBinary = lines.map(l => {
      if (!l.isChanging) return l.isYang ? 1 : 0;
      return l.isYang ? 0 : 1; // 变爻翻转
    });

    const primary = this.binaryToHexagram(primaryBinary);
    const changed = this.binaryToHexagram(changedBinary);

    return {
      primaryHexagram: primary,
      changedHexagram: this.hasAnyChange(lines) ? changed : null
    };
  },

  hasAnyChange(lines) {
    return lines.some(l => l.isChanging);
  },

  binaryToHexagram(binary6) {
    // 下三爻（0,1,2）为下卦；上三爻（3,4,5）为上卦。各从下到上构成三位二进制（1=阳，0=阴）。
    const lower = [binary6[0], binary6[1], binary6[2]];
    const upper = [binary6[3], binary6[4], binary6[5]];
    const trigramKey = bits => bits.join(''); // '111'等
    const lowerKey = trigramKey(lower);
    const upperKey = trigramKey(upper);

    const trigramNames = this.getTrigramNames();
    const lowerName = trigramNames[lowerKey] || '未知';
    const upperName = trigramNames[upperKey] || '未知';

    const hexagramName = this.getHexagramName(upperName, lowerName);

    return {
      upperName,
      lowerName,
      name: hexagramName,
      lines: binary6
    };
  },

  getTrigramNames() {
    // 111 乾，110 兑，101 离，100 震，011 巽，010 坎，001 艮，000 坤
    return {
      '111': '乾',
      '110': '兑',
      '101': '离',
      '100': '震',
      '011': '巽',
      '010': '坎',
      '001': '艮',
      '000': '坤'
    };
  },

  getHexagramName(upper, lower) {
    const map = this.getHexagramMap();
    const key = `${upper}-${lower}`;
    return map[key] || `${upper}${lower}`;
  },

  getHexagramMap() {
    // 64卦名称（上-下）
    return {
      '乾-乾': '乾为天', '乾-兑': '天泽履', '乾-离': '天火同人', '乾-震': '天雷无妄', '乾-巽': '天风姤', '乾-坎': '天水讼', '乾-艮': '天山遁', '乾-坤': '天地否',
      '兑-乾': '泽天夬', '兑-兑': '兑为泽', '兑-离': '泽火革', '兑-震': '泽雷随', '兑-巽': '泽风大过', '兑-坎': '泽水困', '兑-艮': '泽山咸', '兑-坤': '泽地萃',
      '离-乾': '火天大有', '离-兑': '火泽睽', '离-离': '离为火', '离-震': '火雷噬嗑', '离-巽': '火风鼎', '离-坎': '火水未济', '离-艮': '火山旅', '离-坤': '火地晋',
      '震-乾': '雷天大壮', '震-兑': '雷泽归妹', '震-离': '雷火丰', '震-震': '震为雷', '震-巽': '雷风恒', '震-坎': '雷水解', '震-艮': '雷山小过', '震-坤': '雷地豫',
      '巽-乾': '风天小畜', '巽-兑': '风泽中孚', '巽-离': '风火家人', '巽-震': '风雷益', '巽-巽': '巽为风', '巽-坎': '风水涣', '巽-艮': '风山渐', '巽-坤': '风地观',
      '坎-乾': '水天需', '坎-兑': '水泽节', '坎-离': '水火既济', '坎-震': '水雷屯', '坎-巽': '水风井', '坎-坎': '坎为水', '坎-艮': '水山蹇', '坎-坤': '水地比',
      '艮-乾': '山天大畜', '艮-兑': '山泽损', '艮-离': '山火贲', '艮-震': '山雷颐', '艮-巽': '山风蛊', '艮-坎': '山水蒙', '艮-艮': '艮为山', '艮-坤': '山地剥',
      '坤-乾': '地天泰', '坤-兑': '地泽临', '坤-离': '地火明夷', '坤-震': '地雷复', '坤-巽': '地风升', '坤-坎': '地水师', '坤-艮': '地山谦', '坤-坤': '坤为地'
    };
  },

  copyHexagram() {
    // 构造“本卦为...，变卦为...”文本
    const primary = this.data.primaryHexagram;
    const changed = this.data.changedHexagram;
    if (!primary) return;

    const primaryText = `${primary.upperName}${primary.lowerName}${primary.name}卦`;
    const changedText = changed ? `${changed.upperName}${changed.lowerName}${changed.name}卦` : '无变卦';
    const text = `本卦为${primaryText}，变卦为${changedText}。`;

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '卦象已复制', icon: 'success' });
      }
    });
  }

});
