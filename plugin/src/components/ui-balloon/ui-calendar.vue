<template>
  <div
    ref="calendar"
    class="ui-calendar"
  >
    <div class="ui-shortcut" v-if="shortcut">
      <div class="ui-shortcut-body" ref="shortcut">
        <div
          :class="yearClass(yr)"
          :key="'yr_' + y"
          v-for="(yr, y) in years"
        >
          <div class="ui-shortcut-year">{{ yr }}</div>
          <div class="ui-shortcut-months">
            <div class="ui-shortcut-month"
              :class="monthClass(yr, m)"
              :key="'mth_' + m"
              v-for="(mth, m) in monthnames"
              @click="gotoDate(yr, m)"
            >{{ mth.substring(0, 3) }}</div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <div class="ui-calendar-head">
        <div class="ui-calendar-ctrls">
          <div class="ui-calendar-btn --prev" @click="getPrevMonth" />
          <div class="ui-calendar-btn --next" @click="getNextMonth" />
        </div>
      </div>
      <div class="ui-calendar-body">
        <div class="ui-calendar-month" :style="inlinestyle" v-for="(itm, i) in months" :key="i">
          <div :class="titleClass" @click="openShortcut">{{ itm.monthname }} {{ itm.year }}</div>
          <div class="ui-calendar-week">
            <div
              class="ui-calendar-weekday"
              v-for="(day, d) in daynames"
              :key="'day_' + d"
            >
              {{ day }}
            </div>
          </div>
          <div class="ui-calendar-dates">
            <div
              :class="itemClass(subitm.id, subitm.disabled)"
              :key="j"
              @click="selectDate(subitm.id, subitm.disabled)"
              v-for="(subitm, j) in itm.dates"
            >
            {{ subitm.label }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ui-calendar',
  emits: ['input'],
  props: {
    value: Object,
    filter: Object,
    type: String,
    start: String,
    parent: null,
    menu: {
      type: Boolean,
      default: true,
    }
  },
  data () {
    return {
      shortcut: null,
      open: false,
      date: {},
      months: [],
      years: [],
      minWidth: 260,
      inlinestyle: null,
      columns: 1,
      daynames: [
        'Su',
        'Mo',
        'Tu',
        'We',
        'Th',
        'Fr',
        'Sa',
      ],
      monthnames: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    }
  },
  computed: {
    titleClass: function () {
      let output = 'ui-calendar-title'

      if (this.menu) {
        output += ' --shortcut'
      }

      return output
    }
  },
  watch: {
    filter: function () {
      this.getMonths(this.date)
    }
  },
  methods: {
    init () {
      this.columns = this.calcSize()
      this.inlinestyle = { width: 'calc(100% / ' + this.calcSize() + ')' }

      if (this.start) {
        let parts = this.start.split('-')
        this.date = this.parseDate({ year: Number(parts[0]), month: Number(parts[1])-1, day: Number(parts[2]) })
      } else {
        if (this.value && this.value.from) {
          this.date = this.parseDate(this.value.from)
        } else {
          this.date = this.parseDate(this.value)
        }
      }

      this.years = this.getYears()
      this.getMonths(this.date)
    },
    parseDate (value) {
      let output = {}
      let date = value ? new Date(value.year, value.month, value.day) : new Date()
      
      if (isNaN(date.getFullYear()) || isNaN(date.getMonth()) || isNaN(date.getDate())) {
        date = new Date()
      }

      output = {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      }

      return output
    },
    openShortcut () {
      if (!this.menu) {{ return }}
      this.shortcut = true

      this.$nextTick(() => {
        let sel = this.$refs.shortcut.getElementsByClassName('ui-shortcut-item --selected')[0]
        let center = sel.offsetTop - (this.$refs.shortcut.offsetHeight / 2)
        this.$refs.shortcut.scrollTo(0, center)
      })
    },
    handleMonths: function (idx) {
      if (!this.menu) { return }
      if (idx > 0) { return }
      this.shortcut = 'month'
    },
    handleYears: function (idx) {
      if (!this.menu) { return }
      if (idx > 0) { return }
      this.shortcut = 'year'

      this.$nextTick(() => {
        let sel = this.$refs.years.getElementsByClassName('--selected')[0]
        let center = sel.offsetTop - (this.$refs.years.offsetHeight / 2)
        this.$refs.years.scrollTo(0, center)
      })
    },
    closeShortcut () {
      this.shortcut = null
    },
    monthClass (year, month) {
      let output = ''

      if (this.date.year === year && this.date.month === month) {
        output += ' --selected'
      }

      return output
    },
    yearClass (year) {
      let output = 'ui-shortcut-item'

      if (this.date.year === year) {
        output += ' --selected'
      }

      return output
    },
    itemClass (id, disabled) {
      let output = 'ui-calendar-date'
      let now = new Date()
      let today = {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
      }

      if (id === this.stringFormat(today)) {
        output += ' --today'
      }

      if (this.type === 'daterange') {
        if (typeof this.value === 'object') {
          let val = this.$penciller.utils.clone(this.value)
          val.id = id

          let f = new Date(val.from).getTime()
          let t = new Date(val.to).getTime()
          let i = new Date(val.id).getTime()

          if (id === this.value.from) { output += ' --from' }
          if (id === this.value.to) { output += ' --to' }

          if (i > f && i < t) {
            output += ' --between'
          }
        }
      } else {
        if (this.value) {
          let valstr = this.stringFormat(this.value)

          if (id === valstr) {
            output += ' --selected'
          }
        }
      }

      if (disabled === true) {
        output += ' --disabled'
      }

      if (id === null) {
        output += ' --empty'
      }

      return output
    },
    calcSize () {
      let w = this.parent.clientWidth
      let output = 1

      if (this.type === 'daterange') {

        output = Math.floor(w / this.minWidth)

        if (output > 4) { output = 4 }
        if (output < 1) { output = 1 }

      } else {
        output = 1
      }

      return output
    },
    stringFormat (date) {
      let year = String(date.year)
      let month = String(date.month + 1)
      let day = String(date.day)

      if (month < 10) { month = '0' + month }
      if (day < 10) { day = '0' + day }

      return year + '-' + month + '-' + day
    },
    nextMonth (date) {
      let month = date.month + 1
      let year = date.year

      if (month > 11) {
        month = 0
        year++
      }

      let next = new Date(year, month, 15)

      return {
        year: next.getFullYear(),
        month: next.getMonth(),
        day: next.getDate(),
      }
    },
    prevMonth (date) {
      let month = date.month - 1
      let year = date.year

      if (month < 0) {
        month = 11
        year--
      }

      let prev = new Date(year, month, 15)

      return {
        year: prev.getFullYear(),
        month: prev.getMonth(),
        day: prev.getDate(),
      }
    },
    getNextMonth () {
      this.date = this.nextMonth(this.date)
      this.getMonths(this.date)
    },
    getPrevMonth () {
      this.date = this.prevMonth(this.date)
      this.getMonths(this.date)
    },
    getMonths (date) {
      this.months = []
      let colMonth = date

      for (let i=0; i<this.columns; i++) {
        this.months.push(this.getMonth(colMonth))
        colMonth = this.nextMonth(colMonth)
      }
    },
    getMonth (date) {
      let lastObj = new Date(date.year, date.month, 0) // last day of prev month
      let nextObj = this.nextMonth(date)
      let len = new Date(nextObj.year, nextObj.month, 0).getDate() // last day of this month
      let start = lastObj.getDay() + 1

      if (start > 6) { start = 0 }

      let dates = []

      let strMonth = date.month + 1
      let strMonthname = this.monthnames[date.month]
      let strYear = date.year

      if (strMonth < 10) { strMonth = '0' + String(strMonth) }

      for (let i=0; i<(len + start); i++) {
        let label = ''
        let strDay = ''
        let id = null
        let datetime = 0
        let disabled = false

        if (i >= start) {
          strDay = i + 1 - start
          label = strDay
          
          if (strDay < 10) {
            strDay = '0' + String(strDay)
          }

          id = strYear + '-' + strMonth + '-' + strDay
          datetime = new Date(id).getTime()
          disabled = this.isDisabled(datetime, id)
        }
        
        dates.push({ label, id, disabled })
      }

      return { month: strMonth, monthname: strMonthname, year: strYear, dates: dates }
    },
    getYears () {
      let output = []

      for (let yearIdx = this.date.year-50; yearIdx < this.date.year+50; yearIdx++) {
        output.push(yearIdx)
      }

      return output
    },
    gotoMonth (month) {
      this.date = { year: this.date.year, month, day: this.date.day }
      this.getMonths(this.date)
      this.shortcut = false
    },
    gotoYear (year) {
      this.date = { year, month: this.date.month, day: this.date.day }
      this.getMonths(this.date)
      this.shortcut = false
    },
    gotoDate (year, month) {
      this.date = { year, month, day: this.date.day }
      this.getMonths(this.date)
      this.shortcut = false
    },
    selectDate (date, disabled) {
      if (date !== null && disabled !== true) {
        this.$emit('input', date)
      }
    },
    isValidDate (y, m, d) {
      if (!y) { return false }
      if (!m) { return false }
      if (!d) { return false }
      
      let date = new Date(y, m, d)

      return date instanceof Date && !isNaN(date)
    },
    isDisabled(datetime, datestring) {
      let output = null
      let before = false
      let after = false
      let exclude = false

      if (this.filter) {
        for (let key in this.filter.exclude) {
          let val = this.filter.exclude[key]
          let filtertime = new Date(val).getTime()

          switch (key) {
            case 'before':
              if (datetime < filtertime) {
                output = true
              }

              before = true
              break

            case 'after':
              if (datetime > filtertime) {
                output = true
              } else {
                if (!before) { output = null }
              }

              after = true
              break

            case 'is':
              if (Array.isArray(val)) {
                if (val.includes(datestring)) {
                  output = true
                } else {
                  if (!before && !after) { output = null }
                }
              } else {
                if (datetime === filtertime) {
                  output = true
                } else {
                  if (!before && !after) { output = null }
                }
              }
              break
          }

          exclude = true
        }

        for (let key in this.filter.include) {
          let val = this.filter.include[key]
          let filtertime = new Date(val).getTime()

          switch (key) {
            case 'before':
              if (datetime >= filtertime) {
                 if (!exclude) { output = true }
              } else {
                output = null
              }

              before = true
              break

            case 'after':
              if (datetime <= filtertime) {
                if (!before) { output = true }
              } else {
                output = null
              }

              after = true
              break

            case 'is':
              if (Array.isArray(val)) {
                if (!val.includes(datestring)) {
                  if (!before && !after) { output = true }
                } else {
                  output = null
                }
              } else {
                if (datetime !== filtertime) {
                  if (!before && !after) { output = true }
                } else {
                  output = null
                }
              }
              break
          }
        }
      }

      return output
    }
  },
  mounted () {
    if (typeof window === 'object') {
      window.addEventListener('resize', this.init)
    }

      this.years = this.getYears()
      this.init()
  }
}
</script>
<style>
.icon-back {
  width: 2.4rem;
  height: 2.4rem;
  margin: 1rem auto 0 auto;
  opacity: 0.5;
  cursor: pointer;
  display: block;
}

.ui-shortcut {
  height: 26rem;
}

.ui-shortcut-body {
  padding: 1rem;
  height: 100%;
  overflow-y: scroll;
}

.ui-shortcut-item {
  padding: 1rem;
  border: solid 0.2rem var(--color-brdr-quarternary);
  border-radius: 0.6rem;
  margin: 0 0 1rem 0;
  display: flex;
  cursor: pointer;
}

.ui-shortcut-item.--selected {
  border-color: var(--color-active);
}

.ui-shortcut-month.--selected  {
  background-color: var(--color-active);
  color: var(--color-text-inverted);
}

.ui-shortcut-year {
  width: 5rem;
  padding: 1rem;
  font-size: 1.8rem;
}

.ui-shortcut-months {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
  width: 100%;
}

.ui-shortcut-month {
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 0.2rem;
  text-align: center;
}

.ui-calendar {
  background-color: var(--color-bg-primary);
  border-radius: 0.4rem;
  border: solid 0.2rem var(--dim-brdr-primary);
  box-shadow: 0.2rem 0.2rem var(--shade);
  user-select: none;
  overflow: hidden;
  color: var(--color-text-primary);
}

.ui-calendar-head {
  position: relative;
}

.ui-calendar-body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
}

.ui-calendar-month {
  border-width: 0 0.1rem;
  border-style: solid;
  border-color: var(--color-brdr-quarternary);
  padding: 0 2rem;
}

.ui-calendar-month:first-child {
  padding-left: 0;
  border-left: none;
}

.ui-calendar-month:last-child {
  padding-right: 0;
  border-right: none;
}

.ui-calendar-title {
  padding: 0.6rem 1.4rem;
  margin: 0 6rem 0 0;
  display: inline-block;
  position: relative;
  font-size: 1.8rem;
  border-radius: 0.2rem;
}

.ui-calendar-title.--shortcut {
  cursor: pointer;
}

.ui-calendar-monthtitle,
.ui-calendar-yeartitle {
  padding: 0.5rem 0;
  margin: 0 1rem 0 0;
  position: relative;
}

.ui-calendar-ctrls {
  display: flex;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.ui-calendar-btn {
  width: 3rem;
  height: 3rem;
  cursor: pointer;
  border-radius: 0.2rem;
}

.ui-calendar-btn:before {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 2.4rem;
}

.ui-calendar-btn.--prev:before { background-image: url(../../assets/images/icon-arrow-left.svg) }
.ui-calendar-btn.--next:before { background-image: url(../../assets/images/icon-arrow-right.svg) }

.ui-calendar-week {
  display:flex;
  width: 100%;
  color: var(--color-text-secondary);
  border-bottom: solid 0.2rem var(--color-brdr-quarternary);
}

.ui-calendar-weekday {
  width: 14.28%;
  display: flex;
  justify-content: center;
  font-size: 1.3rem;
  padding: 1rem 0;
}

.ui-calendar-dates {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.ui-calendar-date {
  width: 14.28%;
  height: 3.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.3rem;
  border: solid 0.2rem transparent;
  position: relative;
}

.ui-calendar-date.--empty {
  cursor: default;
}

.ui-calendar-date.--disabled {
  opacity: 0.3;
}

.ui-calendar-date.--from,
.ui-calendar-date.--to {
  background-color: var(--color-bg-tertiary);
}

.ui-calendar-date.--selected,
.ui-calendar-date.--between {
  background-color: var(--color-bg-secondary);
}

.ui-calendar-date.--from {
  border-radius: 0.3rem 0 0 0.3rem;
}

.ui-calendar-date.--to {
  border-radius: 0 0.3rem 0.3rem 0;
}

.ui-calendar-date.--from.--to {
  border-radius: 0.3rem;
}

.ui-calendar-date.--from:before,
.ui-calendar-date.--to:before,
.ui-calendar-date.--from.--to:after {
  content: '';
  border-width: 0.6rem;
  border-style: solid;
  border-color: transparent transparent transparent var(--color-bg-tertiary);
  position: absolute;
  top: 50%;
  right: -1.4rem;
  margin-top: -0.6rem;
  z-index: 1;
}

.ui-calendar-date.--to:before {
  border-color: transparent var(--color-bg-tertiary) transparent transparent ;
  left: -1.4rem;
  right: auto;
}

.ui-calendar-date.--from.--to:before {
  border-right-color: var(--color-bg-primary);
  left: auto;
  right: -0.2rem;
}

.ui-calendar-date.--from.--to:after {
  border-left-color: var(--color-bg-primary);
  left: -0.2rem;
  right: auto;
  z-index: 2;
}

.ui-calendar-date.--between {
  border-radius: 0;
}

.ui-calendar-date.--today {
  border-color: var(--dim-brdr-primary);
  border-radius: 0.3rem;
}

.ui-calendar-date.--disabled {
  cursor: default;
}

@media (hover: hover) and (pointer: fine) {
  .ui-calendar-title.--shortcut:hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
  }

  .ui-calendar-btn:hover {
    background-color: var(--hilite-bg-primary);
  }

  .ui-calendar-btn:hover:before {
    filter: invert(100%);
  }

  .ui-calendar-date:not(.--empty):not(.--disabled):hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
    z-index:2;
    border-radius: 0.2rem;
  }

  .ui-calendar.--from .ui-calendar-date:not(.--empty):not(.--disabled):not(.--from.--to):hover:before,
  .ui-calendar.--to .ui-calendar-date:not(.--empty):not(.--disabled):not(.--from.--to):hover:before {
    content: '';
    border-width: 0.6rem;
    border-style: solid;
    border-color: transparent;
    position: absolute;
    top: 50%;
    left: auto;
    right: auto;
    margin-top: -0.6rem;
  }

  .ui-calendar.--from .ui-calendar-date:not(.--empty):not(.--disabled):not(.--from.--to):hover:before {
    border-left-color: var(--hilite-bg-primary);
    right: -1.4rem;
  }

  .ui-calendar.--to .ui-calendar-date:not(.--empty):not(.--disabled):not(.--from.--to):hover:before {
    border-right-color: var(--hilite-bg-primary);
    left: -1.4rem;
  }

  .ui-calendar.--from .ui-calendar-date.--to:not(.--empty):not(.--disabled):not(.--from.--to):hover:before {
    border-left-color: transparent;
    border-right-color: var(--hilite-bg-primary);
    left: -1.4rem;
    right: auto;
  }

  .ui-calendar.--to .ui-calendar-date.--from:not(.--empty):not(.--disabled):not(.--from.--to):hover:before {
    border-right-color: transparent;
    border-left-color: var(--hilite-bg-primary);
    left: auto;
    right: -1.4rem;
  }
}
</style>