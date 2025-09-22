const WEEKDAY_NAMES = ['周一','周二','周三','周四','周五','周六','周日']
const DAY_PERIODS = [
  { key: 'am12', short: '一二节' },
  { key: 'am34', short: '三四节' },
  { key: 'pm56', short: '五六节' },
  { key: 'pm78', short: '七八节' },
  { key: 'ev910', short: '九十节' },
]

// 以 2025-09-01 为第一周（周数计算从1开始）
function calculateWeekNumber(date) {
  const start = new Date(2025, 8, 1) // 月份从0开始，8=9月
  // 计算跨时区影响：取本地时间零点
  const oneDay = 24 * 60 * 60 * 1000
  const days = Math.floor((start.setHours(0,0,0,0), date.setHours(0,0,0,0), (date - start) / oneDay))
  // 将天数除以7，向下取整，再+1 得到周序号（从1开始）。负值也做保护
  return Math.max(1, Math.floor(days / 7) + 1)
}

Page({
  data: {
    currentDate: '',
    weekNumber: 1,
    weekdays: WEEKDAY_NAMES,
    dayPeriods: DAY_PERIODS,
    // 取消上午/下午/晚上分组，仅显示节次
    // 课程数据结构：5 行分别对应 上一二/上三四/下五六/下七八/晚九十
    courses: [
      { 周一: '', 周二: '', 周三: '', 周四: '', 周五: '', 周六: '', 周日: '' },
      { 周一: '', 周二: '', 周三: '', 周四: '', 周五: '', 周六: '', 周日: '' },
      { 周一: '', 周二: '', 周三: '', 周四: '', 周五: '', 周六: '', 周日: '' },
      { 周一: '', 周二: '', 周三: '', 周四: '', 周五: '', 周六: '', 周日: '' },
      { 周一: '', 周二: '', 周三: '', 周四: '', 周五: '', 周六: '', 周日: '' },
    ],
    modal: { visible: false, title: '', content: '' },
  },

  onLoad() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const weekNo = calculateWeekNumber(new Date())
    this.setData({ currentDate: `${y}-${m}-${d}`, weekNumber: weekNo })
  },

  openCell(e) {
    const row = Number(e.currentTarget.dataset.row)
    const col = e.currentTarget.dataset.col
    const title = `${this.data.dayPeriods[row].short} · ${col}`
    const content = this.data.courses[row][col] || ''
    this.setData({ modal: { visible: true, title, content } })
  },

  closeModal() {
    this.setData({ modal: { visible: false, title: '', content: '' } })
  },

  noop() {},
})


