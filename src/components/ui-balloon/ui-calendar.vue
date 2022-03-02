<template>
  <div
    ref="calendar"
    class="ui-calendar"
    @click.stop
  >
    <template v-if="shortcut">
      <div class="ui-shortcut">
        <div class="ui-shortcut-body">
          <div class="ui-shortcut-months" ref="months">
            <div
              :class="monthClass(m)"
              :key="'mth_' + m"
              v-for="(mth, m) in monthnames"
              @click="gotoMonth(m)"
              >
                {{ mth.substring(0, 3) }}
              </div>
          </div>
          <div class="ui-shortcut-years" ref="years">
            <div
              :class="yearClass(yr)"
              :key="'yr_' + y"
              v-for="(yr, y) in years"
              @click="gotoYear(yr)"
            >
              {{ yr }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="ui-calendar-head">
        <div class="ui-calendar-ctrls">
          <div class="ui-calendar-btn --prev" @click="getPrevMonth" />
          <div class="ui-calendar-btn --next" @click="getNextMonth" />
        </div>
      </div>
      <div class="ui-calendar-body">
        <div class="ui-calendar-month" :style="inlinestyle" v-for="(itm, i) in months" :key="i">
          <div :class="titleClass(i)" @click="openShortcut(i)">{{ itm.monthname }} {{ itm.year }}</div>
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
  props: {
    value: Object,
    min: String,
    max: String,
    type: String,
    parent: null,
  },
  data: function() {
    return {
      shortcut: false,
      open: false,
      date: {},
      months: [],
      years: [],
      localMin: this.min,
      localMax: this.max,
      minWidth: 260,
      inlinestyle: null,
      columns: 1,
      daynames: [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
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
  watch: {
    min: function(newValue) {
      this.localMin = newValue
      this.init()
    },
    max: function(newValue) {
      this.localMax = newValue
      this.init()
    }
  },
  methods: {
    init: function() {
      this.columns = this.calcSize()
      this.inlinestyle = { width: 'calc(100% / ' + this.calcSize() + ')' }

      if (this.value && this.value.from) {
        this.date = this.parseDate(this.value.from)
      } else {
        this.date = this.parseDate(this.value)
      }

      this.years = this.getYears()
      this.getMonths(this.date)
    },
    parseDate: function (value) {
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
    openShortcut: function (idx) {
      if (idx > 0) { return }
      this.shortcut = true

      this.$nextTick(() => {
        let sel = this.$refs.years.getElementsByClassName('--selected')[0]
        let center = sel.offsetTop - (this.$refs.years.offsetHeight / 2)
        this.$refs.years.scrollTo(0, center)
      })
    },
    closeShortcut: function () {
      this.shortcut = false
    },
    titleClass: function (idx) {
      let output = 'ui-calendar-title'

      if (idx === 0) {
        output += ' --shortcut'
      }

      return output
    },
    monthClass: function (month) {
      let output = 'ui-shortcut-month'

      if (this.date.month === month) {
        output += ' --selected'
      }

      return output
    },
    yearClass: function (year) {
      let output = 'ui-shortcut-year'

      if (this.date.year === year) {
        output += ' --selected'
      }

      return output
    },
    itemClass: function(id, disabled) {
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
          let val = this.value
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
    calcSize: function() {
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
    stringFormat: function (date) {
      let year = String(date.year)
      let month = String(date.month + 1)
      let day = String(date.day)

      if (month < 10) { month = '0' + month }
      if (day < 10) { day = '0' + day }

      return year + '-' + month + '-' + day
    },
    nextMonth: function (date) {
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
    prevMonth: function (date) {
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
    getNextMonth: function() {
      this.date = this.nextMonth(this.date)
      this.getMonths(this.date)
    },
    getPrevMonth:  function() {
      this.date = this.prevMonth(this.date)
      this.getMonths(this.date)
    },
    getMonths: function(date) {
      this.months = []
      let colMonth = date

      for (let i=0; i<this.columns; i++) {
        this.months.push(this.getMonth(colMonth))
        colMonth = this.nextMonth(colMonth)
      }
    },
    getMonth: function(date) {
      let lastObj = new Date(date.year, date.month, 0) // last day of prev month
      let nextObj = this.nextMonth(date)
      let len = new Date(nextObj.year, nextObj.month, 0).getDate() // last day of this month
      let start = lastObj.getDay() + 1
      let mintime = false
      let maxtime = false

      if (this.localMax) { maxtime = new Date(this.localMax).getTime() }
      if (this.localMin) { mintime = new Date(this.localMin).getTime() }

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

          if (maxtime) {
            if (datetime > maxtime) {
              disabled = true
            }
          }

          if (mintime) {
            if (datetime < mintime) {
              disabled = true
            }
          }
        }
        
        dates.push({ label, id, disabled })
      }

      return { month: strMonth, monthname: strMonthname, year: strYear, dates: dates }
    },
    getYears: function () {
      let output = []

      for (let yearIdx = this.date.year-50; yearIdx < this.date.year+50; yearIdx++) {
        output.push(yearIdx)
      }

      return output
    },
    gotoMonth: function (month) {
      this.date = { year: this.date.year, month, day: this.date.day }
      this.getMonths(this.date)
      this.shortcut = false
    },
    gotoYear: function (year) {
      this.date = { year, month: this.date.month, day: this.date.day }
      this.getMonths(this.date)
      this.shortcut = false
    },
    selectDate: function(date, disabled) {
      if (date !== null && disabled !== true) {
        this.$emit('input', date)
      }
    },
    isValidDate(y, m, d) {
      if (!y) { return false }
      if (!m) { return false }
      if (!d) { return false }
      
      let date = new Date(y, m, d)

      return date instanceof Date && !isNaN(date)
    }
  },
  mounted: function() {
    if (typeof window === 'object') {
      window.addEventListener('resize', this.init)
    }

    this.$nextTick(this.init)
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

.ui-shortcut-body {
  display: flex;
  height: 26rem;
}

.ui-shortcut-months {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  column-gap: 1rem;
  row-gap: 1rem;
  flex-grow: 1;
  padding: 1rem;
  height: 100%;
}

.ui-shortcut-month {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.3rem;
  cursor: pointer;
}

.ui-shortcut-years {
  flex: 0 0 10rem;
  height: calc(100% - 2rem);
  overflow: auto;
  margin: 1rem;
  border: solid 0.2rem var(--dim-brdr-primary);
  border-radius: 0.3rem;
}

.ui-shortcut-year {
  padding: 0.8rem 2rem;
  border-bottom: solid 0.1rem var(--color-brdr-quarternary);
  cursor: pointer;
}

.ui-shortcut-year:last-child {
  border-bottom: none;
}

.ui-shortcut-month.--selected,
.ui-shortcut-year.--selected {
  color: var(--color-text-active);
}

.ui-calendar {
  background-color: var(--color-bg-primary);
  border-radius: 0.4rem;
  border: solid 0.2rem var(--dim-brdr-primary);
  box-shadow: 0.2rem 0.2rem var(--shade);
  overflow: auto;
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
  padding: 0.5rem 4rem 0.5rem 1rem;
  margin: 0 0 0.5rem 0;
  display: inline-block;
  border-radius: 0.3rem;
  position: relative;
}

.ui-calendar-title.--shortcut {
  cursor: pointer;
}

.ui-calendar-title.--shortcut:after {
  content: '';
  width: 2rem;
  height: 2rem;
  position: absolute;
  top: 0.7rem;
  right: 1rem;
  background: url(../../assets/images/icon-arrow-down.svg) center bottom no-repeat;
  background-size: 2.4rem;
  opacity: 0.5;
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
  background-position: center;
  background-repeat: no-repeat;
  background-size: 2.4rem;
  cursor: pointer;
  opacity: 0.5;
}

.ui-calendar-btn.--prev { background-image: url(../../assets/images/icon-arrow-left.svg) }
.ui-calendar-btn.--next { background-image: url(../../assets/images/icon-arrow-right.svg) }

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

.ui-calendar-date.--from:before,
.ui-calendar-date.--to:before {
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
  .ui-shortcut-month:hover,
  .ui-shortcut-year:hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
    border-color: var(--hilite-bg-primary);
  }

  .ui-calendar-btn:hover,
  .ui-calendar-title:hover:after {
    opacity: 1;
  }

  .ui-calendar-date:not(.--empty):not(.--disabled):hover {
    background-color: var(--hilite-bg-primary);
    color: var(--color-text-inverted);
    z-index:2;
    border-radius: 0.2rem;
  }

  .ui-calendar.--from .ui-calendar-date:not(.--empty):not(.--disabled):hover:before,
  .ui-calendar.--to .ui-calendar-date:not(.--empty):not(.--disabled):hover:before {
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

  .ui-calendar.--from .ui-calendar-date:not(.--empty):not(.--disabled):hover:before {
    border-left-color: var(--hilite-bg-primary);
    right: -1.4rem;
  }

  .ui-calendar.--to .ui-calendar-date:not(.--empty):not(.--disabled):hover:before {
    border-right-color: var(--hilite-bg-primary);
    left: -1.4rem;
  }

  .ui-calendar.--from .ui-calendar-date.--to:not(.--empty):not(.--disabled):hover:before {
    border-left-color: transparent;
    border-right-color: var(--hilite-bg-primary);
    left: -1.4rem;
    right: auto;
  }

  .ui-calendar.--to .ui-calendar-date.--from:not(.--empty):not(.--disabled):hover:before {
    border-right-color: transparent;
    border-left-color: var(--hilite-bg-primary);
    left: auto;
    right: -1.4rem;
  }
}
</style>