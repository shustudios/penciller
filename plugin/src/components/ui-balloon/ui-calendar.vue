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
              @click="handleDate(yr, m)"
            >{{ mth.substring(0, 3) }}</div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <div class="ui-calendar-head">
        <div class="ui-calendar-ctrls">
          <div class="ui-calendar-btn --prev" @click="handlePrevMonth" />
          <div class="ui-calendar-btn --next" @click="handleNextMonth" />
        </div>
      </div>
      <div class="ui-calendar-body">
        <div class="ui-calendar-month" :style="inlinestyle" v-for="(itm, i) in months" :key="i">
          <div :class="titleClass" @click="handleShortcut">{{ itm.monthname }} {{ itm.year }}</div>
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
              @click="handleSelect(subitm.id, subitm.disabled)"
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
    value: [Date, Object, String],
    filter: Object,
    type: String,
    start: [Date, Object, String],
    parent: null,
    menu: {
      type: Boolean,
      default: true,
    },
    format: {
      type: String,
      default: 'date',
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
    localValue: function () {
      let output = null

      if (this.type === 'daterange') {
        if (this.value.from && this.value.to) {
          output = this.formatRange(this.value)
        }
      } else {
        if (this.value) {
          output = this.formatValue(this.value)
        }
      }

      return output
    },
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
        this.date = this.formatValue(this.start).plainObject
      } else {
        if (this.localValue) {
          if (this.type === 'daterange') {
            this.date = this.localValue.plainObject.from
          } else {
            this.date = this.localValue.plainObject
          }
        } else {
          this.date = this.dateToObject(new Date())
        }
      }

      this.years = this.getYears()
      this.getMonths(this.date)
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
    isCorrectFormat (val) {
      let output = false

      if (typeof val === 'object') {
        if (val instanceof Date && this.format === 'date') {
          output = true
        } else if (this.format === 'object') {
          output = true
        }
      } else if (typeof val === 'string' && this.format === 'string') {
        output = true
      }

      return output
    },
    formatRange (val) {
      let output = null
      let from = this.formatValue(val.from)
      let to = this.formatValue(val.to)

      if (from && to) {
        output = {
          plainObject: { from:from.plainObject, to:to.plainObject },
          dateObject: { from:from.dateObject, to:to.dateObject },
          dateString: { from:from.dateString, to:to.dateString },
        }
      }

      return output
    },
    formatValue (val) {
      let output = null

      if (this.isCorrectFormat(val)) {
        switch (this.format) {
          case 'date':
            output = {
              plainObject: this.dateToObject(val),
              dateObject: val,
              dateString: this.dateToString(val)
            }
            break

          case 'object':
            output = {
              plainObject: val,
              dateObject: this.objectToDate(val),
              dateString: this.objectToString(val)
            }
            break

          case 'string':
            output = {
              plainObject: this.stringToObject(val),
              dateObject: this.stringToDate(val),
              dateString: val
            }
            break
        }
      }

      return output
    },
    stringToDate (datestr) {
      let output
      let parts = datestr.split('-')
      let year = Number(parts[0])
      let month = Number(parts[1])-1
      let day = Number(parts[2])

      output = new Date(year, month, day)

      return output
    },
    stringToObject (datestr) {
      let output
      let parts = datestr.split('-')

      output = {
        year: Number(parts[0]),
        month: Number(parts[1])-1,
        day: Number(parts[2]),
      }

      return output
    },
    dateToObject (date) {
      let output

      output = {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
      }

      return output
    },
    dateToString (date) {
      let output = ''

      output += String(date.getFullYear()) + '-'
      output += String(date.getMonth() + 1).padStart(2, 0) + '-'
      output += String(date.getDate()).padStart(2, 0)

      return output
    },
    objectToDate (obj) {
      let output = new Date(obj.year, obj.month, obj.day)
      return output
    },
    objectToString (obj) {
      let output = ''

      output += String(obj.year) + '-'
      output += String(obj.month + 1).padStart(2, 0) + '-'
      output += String(obj.day).padStart(2, 0)

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
      let today = this.dateToString(new Date())

      if (id === today) {
        output += ' --today'
      }

      if (this.type === 'daterange') {
        if (this.localValue !== null) {

          let f = new Date(this.localValue.dateString.from).getTime()
          let t = new Date(this.localValue.dateString.to).getTime()
          let i = new Date(id).getTime()

          if (id === this.localValue.dateString.from) { output += ' --from' }
          if (id === this.localValue.dateString.to) { output += ' --to' }

          if (i > f && i < t) {
            output += ' --between'
          }
        }
      } else {
        if (this.localValue && id === this.localValue.dateString) {
          output += ' --selected'
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
    nextMonth (date) {
      let month = date.month + 1
      let year = date.year

      if (month > 11) {
        month = 0
        year++
      }

      return this.dateToObject(new Date(year, month, 15))
    },
    prevMonth (date) {
      let month = date.month - 1
      let year = date.year

      if (month < 0) {
        month = 11
        year--
      }

      return this.dateToObject(new Date(year, month, 15))
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
          
          datetime = this.stringToDate(id).getTime()
          disabled = this.filterDate(datetime, id)
        }
        
        dates.push({ label, id, disabled })
      }

      return { month: strMonth, monthname: strMonthname, year: strYear, dates: dates }
    },
    getMonths (date) {
      this.months = []
      let colMonth = date

      for (let i=0; i<this.columns; i++) {
        this.months.push(this.getMonth(colMonth))
        colMonth = this.nextMonth(colMonth)
      }
    },
    getYears () {
      let output = []

      for (let yearIdx = this.date.year-50; yearIdx < this.date.year+50; yearIdx++) {
        output.push(yearIdx)
      }

      return output
    },
    filterDate(datetime, datestring) {
      let output = null
      let before = false
      let after = false
      let exclude = false

      if (this.filter) {
        for (let key in this.filter.exclude) {
          let val = this.filter.exclude[key]
          let filtertime = this.formatValue(val)
          
          if (filtertime) {
            filtertime.dateObject.setHours(0,0,0,0)
            filtertime = filtertime.dateObject.getTime()
          }

          switch (key) {
            case 'before':
              if (filtertime) {
                if (datetime < filtertime) {
                  output = true
                }

                before = true
              }
              break

            case 'after':
              if (filtertime) {
                if (datetime > filtertime) {
                  output = true
                } else {
                  if (!before) { output = null }
                }

                after = true
              }
              break

            case 'is':
              if (Array.isArray(val)) {
                let filtertimes = []
                
                val.forEach(date => {
                  filtertimes.push(this.formatValue(date).dateString)
                })
                
                if (filtertimes.includes(datestring)) {
                  output = true
                } else {
                  if (!before && !after) { output = null }
                }
              } else {
                if (filtertime) {
                  if (datetime === filtertime) {
                    output = true
                  } else {
                    if (!before && !after) { output = null }
                  }
                }
                
              }
              break
          }

          exclude = true
        }

        for (let key in this.filter.include) {
          let val = this.filter.include[key]
          let filtertime = this.formatValue(val)

          if (filtertime) {
            filtertime.dateObject.setHours(0,0,0,0)
            filtertime = filtertime.dateObject.getTime()
          }

          switch (key) {
            case 'before':
              if (filtertime) {
                if (datetime >= filtertime) {
                  if (!exclude) { output = true }
                } else {
                  output = null
                }

                before = true
              }
              break

            case 'after':
              if (filtertime) {
                if (datetime <= filtertime) {
                  if (!before) { output = true }
                } else {
                  output = null
                }

                after = true
              }
              break

            case 'is':
              if (Array.isArray(val)) {
                let filtertimes = []
                
                val.forEach(date => {
                  filtertimes.push(this.formatValue(date).dateString)
                })

                if (!filtertimes.includes(datestring)) {
                  if (!before && !after) { output = true }
                } else {
                  output = null
                }
              } else {
                if (filtertime) {
                  if (datetime !== filtertime) {
                    if (!before && !after) { output = true }
                  } else {
                    output = null
                  }
                }
                
              }
              break
          }
        }
      }

      return output
    },
    handleNextMonth () {
      this.date = this.nextMonth(this.date)
      this.getMonths(this.date)
    },
    handlePrevMonth () {
      this.date = this.prevMonth(this.date)
      this.getMonths(this.date)
    },
    handleDate (year, month) {
      this.date = { year, month, day: this.date.day }
      this.getMonths(this.date)
      this.closeShortcut()
    },
    handleShortcut () {
      this.openShortcut()
    },
    handleSelect (date, disabled) {
      let output
      
      if (!isNaN(new Date(date).getTime()) && disabled !== true) {
        switch (this.format) {
          case 'date':
            output = this.stringToDate(date)
            break

          case 'object':
            output = this.stringToObject(date)
            break

          case 'string':
            output = date
            break
        }

        this.$emit('input', output)
      }
    },
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