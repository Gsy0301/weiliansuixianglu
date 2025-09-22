const WEEKDAY_NAMES = ['周一','周二','周三','周四','周五','周六','周日']
const DAY_PERIODS = [
  { key: 'p1', short: '一' },
  { key: 'p2', short: '二' },
  { key: 'p3', short: '三' },
  { key: 'p4', short: '四' },
  { key: 'p5', short: '五' },
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
      // 一二节
      {
        周一: '中国古代文学III 考试 付华 [1-18]周 单周 1-2节 100412',
        周二: '中国古代文学III 考试 付华 [1-18]周 1-2节 100412',
        周三: '大学英语III 考试 贾曼丽 [1-16]周 1-2节 智慧教室510',
        周四: '', 周五: '', 周六: '', 周日: ''
      },
      // 三四节
      {
        周一: '毛泽东思想和中国特色社会主义理论体系概论 考试 刘尚裔 [1-16]周 3-4节 100225',
        周二: '大学体育III 考试 刘博 [1-18]周 3-4节 匹克球 南区操场\n大学体育III 考试 刘佳 [1-18]周 3-4节 广场舞 南区操场\n大学体育III 考试 李林林 [1-18]周 3-4节 健美操 南区操场\n大学体育III 考试 张永礼 [1-18]周 3-4节 排球 南区排球场\n大学体育III 考试 彭前 [1-18]周 3-4节 排球 南区排球场\n大学体育III 考试 张宏 [1-18]周 3-4节 网球 南区网球场\n大学体育III 考试 董谆 [1-18]周 3-4节 篮球 南区篮球场\n大学体育III 考试 刘洋 [1-18]周 3-4节 跆拳道 南区操场\n大学体育III 考试 郝放 [1-18]周 3-4节 体育舞蹈 南区操场\n大学体育III 考试 李军舰 [1-18]周 3-4节 羽毛球 南区操场',
        周三: '教育学 考试 韩淑华 [1-18]周 3-4节 智慧教室603',
        周四: '毛泽东思想和中国特色社会主义理论体系概论 考试 刘尚裔 [1-16]周 单周 3-4节 100225\n中国现当代文学Ⅱ 考查 张保华 [1-18]周 双周 3-4节 100513',
        周五: '', 周六: '', 周日: ''
      },
      // 五六节
      {
        周一: '创新创意创造方法 考查 黄娟娟 [1-16]周 5-6节 智慧教室602',
        周二: '',
        周三: '',
        周四: '中国现当代文学Ⅱ 考查 张保华 [1-18]周 5-6节 100414',
        周五: '', 周六: '', 周日: ''
      },
      // 七八节
      {
        周一: '古代汉语Ⅰ 考试 王耿 [1-18]周 单周 7-8节 100520\n语文课程教学论 考试 王菲菲 [1-18]周 双周 7-8节 100415',
        周二: '舌尖上的植物学 考查 梁思佳 [3,8,12,15]周 7-8节 线下班级 6D3',
        周三: '语文课程教学论 考试 王菲菲 [1-18]周 7-8节 100415',
        周四: '古代汉语Ⅰ 考试 王耿 [1-18]周 7-8节 100521',
        周五: '', 周六: '', 周日: ''
      },
      // 九十节
      {
        周一: '中国现当代文学Ⅱ 考 张保华 [1-18]周 9-10节 100513',
        周二: '',
        周三: '大学日语III 考试 苗迎春 [1-16]周 9-10节 南区班级 100124',
        周四: '', 周五: '', 周六: '', 周日: ''
      },
    ],
    modal: { visible: false, title: '', content: '', html: '' },
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
    const content = (this.data.courses[row][col] || '').replace(/\n/g, '\n')
    this.setData({ modal: { visible: true, title, content } })
  },

  closeModal() {
    this.setData({ modal: { visible: false, title: '', content: '' } })
  },

  noop() {},
})


