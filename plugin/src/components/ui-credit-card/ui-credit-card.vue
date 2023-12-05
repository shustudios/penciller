<template>
  <div class="ui-creditcard">
    <ui-field
      ref="number"
      type="creditcardnumber"
      :name="name + '-number'"
      :autocomplete="autocompleteNumber"
      :stripe="stripe"
      label="Credit / Debit Card"
    />
    <ui-field
      ref="expiry"
      type="creditcardexpiry"
      :name="name + '-expiry'"
      :autocomplete="autocompleteExpiry"
      :stripe="stripe"
      label="Expiry"
    />
    <ui-field
      ref="cvc"
      type="creditcardcvv"
      :name="name + '-cvc'"
      :autocomplete="autocompleteCVC"
      :stripe="stripe"
      label="CVC"
    />
  </div>
</template>

<script>
import UiField from '../ui-field/ui-field.vue'

export default {
  name: 'ui-creditcard',
  inheritAttrs: false,
  components: {
    UiField,
  },
  props: {
    style: Object,
    name: String,
    autocomplete: String,
    stripe: Object,
  },
  data () {
    return {
      numberElement: null,
      expiryElement: null,
      cvcElement: null,
    }
  },
  computed: {
    autocompleteNumber () {
      if (this.autocomplete === 'off') {
        return 'off'
      } else {
        return 'cc-number'
      }
    },
    autocompleteExpiry () {
      if (this.autocomplete === 'off') {
        return 'off'
      } else {
        return 'cc-exp'
      }
    },
    autocompleteCVC () {
      if (this.autocomplete === 'off') {
        return 'off'
      } else {
        return 'cc-csc'
      }
    }
  },
  methods: {
    handleInput () {
      let input = {
        number: this.numberElement,
        expiry: this.expiryElement,
        cvc: this.cvcElement,
      }

      this.$emit('input', input)
    }
  },
  mounted () {
    if (this.stripe) {
      let elements = this.stripe.elements()
      let options = {
        style: {
          base: {
            fontSize: '16px',
            color: '#333',
            '::placeholder': {
              color: '#dcdcdc',
            },
          },
          invalid: {
            color: '#333',
          }
        }
      }

      this.numberElement = elements.create('cardNumber', options)
      this.expiryElement = elements.create('cardExpiry', options)
      this.cvcElement = elements.create('cardCvc', { ...options, placeholder: '' })

      this.numberElement.mount('#StripeCardNumber')
      this.expiryElement.mount('#StripeCardExpiry')
      this.cvcElement.mount('#StripeCardCVC')

      this.numberElement.on('change', e => {
        if (e.empty) {
          this.$refs.number.localValue = ''
        } else if (e.complete) {
          this.$refs.number.localValue = '4111111111111111'
        } else {
          this.$refs.number.localValue = '123'
        }

        this.handleInput()
      })

      this.expiryElement.on('change', e => {
        if (e.empty) {
          this.$refs.expiry.localValue = ''
        } else if (e.complete) {
          this.$refs.expiry.localValue = '05/23'
        } else {
          this.$refs.expiry.localValue = '123'
        }

        this.handleInput()
      })

      this.cvcElement.on('change', e => {
        if (e.complete) {
          this.$refs.cvc.localValue = '442'
        } else {
          this.$refs.cvc.localValue = ''
        }

        this.handleInput()
      })
    }
  }
}
</script>

<style>
.ui-creditcard {
  display: flex;
  width: 100%;
}

.ui-creditcard .ui-field.--creditcardnumber {
  flex-grow: 1;
}

.ui-creditcard .ui-field.--creditcardexpiry {
  margin: 0 1rem;
}
</style>