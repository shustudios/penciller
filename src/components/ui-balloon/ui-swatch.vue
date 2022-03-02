<template>
  <div
    ref="swatch"
    class="ui-swatch"
    @click.stop
  >
    <div class="ui-swatch-body" v-if="options">
      <div class="ui-swatch-slots">
        <div
          v-for="(slot, slotIdx) in options"
          :data-swatch="slot"
          :key="'slot' + slotIdx"
          :style="swatchStyle(slot)"
          class="ui-swatch-slot"
          @click="handleInput(slot)"
        />
      </div>
    </div>
    <div class="ui-swatch-body" v-else>
      <div class="ui-swatch-samples" @click="handleInput(sample)">
        <canvas ref="from" class="ui-swatch-sample" />
        <canvas ref="to" class="ui-swatch-sample" />
      </div>
      <canvas
        ref="grade"
        class="ui-swatch-slider"
        @mousemove="handleOverGrade"
        @mouseout="handleOutGrade"
        @click="handleGrade"
      />
      <canvas
        ref="color"
        class="ui-swatch-slider"
        @mousemove="handleOverColor"
        @mouseout="handleOutColor"
        @click="handleColor"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ui-swatch',
  props: {
    value: String,
    parent: null,
    options: Array,
  },
  data: function() {
    return {
      open: false,
      sample: this.validate(this.value)
    }
  },
  watch: {
    value: function (newValue) {
      let regex = /^#([0-9A-F]{3}){1,2}$/i
      
      if (regex.test(newValue)) {
        this.setSample(newValue, 'to')
        this.sample = newValue
      }
    }
  },
  methods: {
    init: function () {
      this.drawColors()
      this.drawGrade(this.sample)
      this.setSample(this.sample, 'from')
      this.setSample(this.sample, 'to')
    },
    validate: function (color) {
      let output = '#0000FF'

        if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
          if (color.length === 4) {
            output = this.longhand(color)
          } else {
            output = color
          }
        }

        return output
    },
    longhand: function (color) {
      let r = color.substring(1,2)
      let g = color.substring(2,3)
      let b = color.substring(3,4)

      return '#' + r + r + g + g + b + b
    },
    swatchStyle: function (val) {
      let output = '--swatch: '

      if (val) {
        output += val
      } else {
        output += '#fff'
      }

      return output
    },
    getElementPosition: function (elm, x, y) {
      let output = null

      if (elm.offsetParent) {
        let curLeft = x + elm.offsetLeft
        let curTop = y + elm.offsetTop

        output = this.getElementPosition(elm.offsetParent, curLeft, curTop)
      } else {
        output = { x, y }
      }

      return output
    },
    getEventLocation: function (elm, e, x, y) {
      let pos = this.getElementPosition(elm, x, y)

      return {
        x: e.pageX - pos.x,
        y: e.pageY - pos.y,
      }
    },
    rgbToHex: function (r, g, b) {
      if (r > 255 || g > 255 || b > 255) {
        throw "Invalid color value"
      } else {
        return ((r << 16) | (g << 8) | b).toString(16)
      }
    },
    hexToHsl: function (hex) {
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

      let r = parseInt(result[1], 16)
      let g = parseInt(result[2], 16)
      let b = parseInt(result[3], 16)

      r /= 255, g /= 255, b /= 255
      let max = Math.max(r, g, b), min = Math.min(r, g, b)
      let h, s, l = (max + min) / 2

      if(max == min){
        h = s = 0 // achromatic
      } else {
        var d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }

      // s = s*100
      // s = Math.round(s)
      // l = l*100
      // l = Math.round(l)
      s = 100
      l = 50
      h = Math.round(360*h)

      return 'hsl(' + h + ', ' + s + '%, ' + l + '%)'
    },
    drawGrade: function (color) {
      if (this.$refs.grade) {
        let canvas = this.$refs.grade
        let rec = this.$el.getBoundingClientRect()

        canvas.width = rec.width - 8
        canvas.height = 50

        let context = canvas.getContext('2d')
        let gradientX = context.createLinearGradient(0, 0, canvas.width, 0)

        gradientX.addColorStop(0, '#ffffff')
        gradientX.addColorStop(1, this.hexToHsl(color))

        context.fillStyle = gradientX
        context.fillRect(0, 0, canvas.width, canvas.height)

        let gradientY = context.createLinearGradient(0, 0, 0, canvas.height)

        gradientY.addColorStop(0, 'rgba(0,0,0,0)')
        gradientY.addColorStop(1, 'rgba(0,0,0,1)')

        context.fillStyle = gradientY
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
    },
    drawColors: function () {
      if (this.$refs.color) {
        let canvas = this.$refs.color
        let rec = this.$el.getBoundingClientRect()

        canvas.width = rec.width - 8
        canvas.height = 10

        let context = canvas.getContext('2d')
        let gradient = context.createLinearGradient(0, 0, rec.width, 0)

        gradient.addColorStop(0, 'hsl(0,100%,50%)')
        gradient.addColorStop(0.143, 'hsl(60,100%,50%)')
        gradient.addColorStop(0.286, 'hsl(60,100%,50%)')
        gradient.addColorStop(0.429, 'hsl(120,100%,50%)')
        gradient.addColorStop(0.572, 'hsl(180,100%,50%)')
        gradient.addColorStop(0.715, 'hsl(240,100%,50%)')
        gradient.addColorStop(0.858, 'hsl(300,100%,50%)')
        gradient.addColorStop(1, 'hsl(360,100%,50%)')

        context.fillStyle = gradient
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
    },
    setSample: function (color, sample) {
      if (this.$refs[sample]) {
        if (color) {
          this.$refs[sample].style.backgroundColor = color
        } else {
          this.$refs[sample].style.backgroundColor = '#ff0000'
        }
      }
    },
    getSample: function (canvas, e) {
      let pos = this.getEventLocation(canvas, e, 0, 0)
      let context = canvas.getContext('2d')
      let pixel = context.getImageData(pos.x, pos.y, 1, 1).data
      let hex = '#' + ("000000" + this.rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6)

      return hex
    },
    handleOverColor: function (e) {
      let color = this.getSample(this.$refs.color, e)

      this.setSample(color, 'to')
      this.drawGrade(color)
    },
    handleOutColor: function () {
      this.setSample(this.sample, 'to')
      this.drawGrade(this.sample)
    },
    handleColor: function (e) {
      this.sample = this.getSample(this.$refs.color, e)

      this.setSample(this.sample, 'to')
      this.setSample(this.sample, 'from')
      this.drawGrade(this.sample)
    },
    handleOverGrade: function (e) {
      let color = this.getSample(this.$refs.grade, e)

      this.setSample(color, 'to')
    },
    handleOutGrade: function () {
      this.setSample(this.sample, 'to')
    },
    handleGrade: function (e) {
      this.sample = this.getSample(this.$refs.grade, e)

      this.setSample(this.sample, 'from')
      this.setSample(this.sample, 'to')
    },
    handleInput: function (color) {
      if (color.length === 4) {
        this.$emit('input', this.longhand(color))
      } else {
        this.$emit('input', color)
      }
    }
  },
  mounted: function() {
    if (typeof window === 'object') {
      window.addEventListener('resize', this.init)
    }

    if (this.$refs.sample) {
      this.$refs.sample.addEventListener('animationend', () => {
        this.$refs.sample.style.animation = 'none'
      })
    }

    setTimeout(this.init, 1)
  }
}
</script>
<style>
.ui-swatch {
  background-color: var(--color-bg-primary);
  border-radius: 0.4rem;
  border: solid 0.2rem var(--dim-brdr-primary);
  box-shadow: 0.2rem 0.2rem var(--shade);
  overflow: auto;
  user-select: none;
  overflow: auto;
  color: var(--color-text-primary);
}

.ui-swatch-slots {
  display: flex;
  flex-wrap: wrap;
}

.ui-swatch-slot {
  width: 12.5%;
  padding-top: 12.5%;
  position: relative;
  cursor: pointer;
}

.ui-swatch-slot:after {
  content: '';
  position: absolute;
  top: 0.2rem;
  left: 0.2rem;
  width: calc(100% - 0.4rem);
  height: calc(100% - 0.4rem);
  background-color: var(--swatch);
}

.ui-swatch-slot:last-child {
  border: none;
}

.ui-swatch-body {
  padding: 0.2rem;
  max-height: 13rem;
}

.ui-swatch-samples {
  display: flex;
  height: calc(100% - 6.4rem);
}

.ui-swatch-sample {
  background-color: var(--color-bg-secondary);
  width: 50%;
  height: 100%;
  cursor: pointer;
  display: block;
}

.ui-swatch-slider {
  margin: 0.2rem 0 0 0;
  cursor: pointer;
  display: block;
}

@media (hover: hover) and (pointer: fine) {
  
}
</style>