// index.js
Page({
  data: {},
  goToFoodDice() {
    wx.navigateTo({ url: '/pages/food-dice/food-dice' })
  },
  goToTimetable() {
    wx.navigateTo({ url: '/pages/timetable/timetable' })
  },
})
