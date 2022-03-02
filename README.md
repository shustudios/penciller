# penciller
UI library for Vue 2

## Installation
```
npm install @shustudios/penciller
```

## Usage
Import the library into your Vue project (main.js):
```
import Vue from 'vue'
import Ui from '@shustudios/ui'

Vue.use(Ui)
```

For Nuxt projects, create a plugin file (/plugins/ui.js) with the above code and add the plugin to `nuxt.config.js`:

```
plugins: [
  { src: '~plugins/ui.js' },
],
```

You will also need to transpile the plugin in `nuxt.config.js`:

```
build: {
  extend (config, ctx) {
  },
  transpile: ['@shustudios/ui']
},
  ```


### Documentation
Learn more at [Shustudios.Com](https://shustudios.com/penciller/).
