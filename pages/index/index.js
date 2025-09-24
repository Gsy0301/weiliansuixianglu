// index.js
Page({
  data: {},
  goToFoodDice() {
    wx.navigateTo({ url: '/pages/food-dice/food-dice' })
  },
  goToTimetable() {
    wx.navigateTo({ url: '/pages/timetable/timetable' })
  },
  goToCoinDivination() {
    wx.navigateTo({ url: '/pages/coin-divination/coin-divination' })
  },
  goToQingjing() {
    wx.navigateTo({ url: '/pages/qingjing/qingjing' })
  },
})
