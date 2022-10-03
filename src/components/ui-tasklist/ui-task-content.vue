<template>
  <div
    ref="input"
    :contenteditable="!disabled"
    :placeholder="placeholder"
    @input="handleInput"
    @keydown.enter="handleEnter"
    @keydown.backspace="handleBackspace"
    @keydown.space="handleSpace"
    @keydown.up="handleUp"
    @paste="handlePaste"
    @focus="handleFocus"
    @blur="handleBlur"
    @mouseup="handleMouseUp"
    v-html="value"
  />
</template>

<script>
export default {
  name: 'ui-task-content',
  emits: [
    'input',
    'enter',
    'backspace',
    'space',
    'up',
    'focus',
    'blur',
    'mouseup',
  ],
  props: {
    value: String,
    disabled: Boolean,
    placeholder: String,
  },
  data () {
    return {
      pos: [],
      restore: null,
    }
  },
  methods: {
    handleInput (e) {
      e.preventDefault()

      let newValue = this.getText(this.$refs.input)
      this.restore = this.saveCaretPosition(this.$refs.input);
      this.$emit('input', newValue)
    },
    handlePaste (e) {
      e.preventDefault()

      let text = (e.originalEvent || e).clipboardData.getData('text/plain');
      document.execCommand("insertText", false, text)
    },
    handleEnter (e) {
      this.$emit('enter', e)
    },
    handleBackspace (e) {
      this.$emit('backspace', e)
    },
    handleSpace (e) {
      this.$emit('space', e)
    },
    handleUp (e) {
      this.$emit('up', e)
    },
    handleFocus (e) {
      this.placeCaretAtEnd()
      this.$emit('focus', e)
    },
    handleBlur (e) {
      this.$emit('blur', e)
    },
    handleMouseUp (e) {
      this.$emit('mouseup', e)
    },
    getText (element) {
      if (element.firstChild) {
        let firstTag = element.firstChild.nodeName;
        let keyTag = new RegExp(
          firstTag === '#text' ? '<br' : '</' + firstTag,
          'i'
        );
        let tmp = document.createElement('p');
        tmp.innerHTML = element.innerHTML
          .replace(/<[^>]+>/g, (m) => (keyTag.test(m) ? '{ß®}' : ''))
          .replace(/{ß®}$/, '');
        return tmp.innerText.replace(/{ß®}/g, '\n');
      } else {
        return  ''
      }
    },
    saveCaretPosition (context){
      var selection = window.getSelection();
      var range = selection.getRangeAt(0);
      range.setStart(  context, 0 );
      var len = range.toString().length;

      return function restore(){
          var pos = this.getTextNodeAtPosition(context, len);

          if (pos.node.nodeType === 3) { // quick hack -sm
            selection.removeAllRanges();
            var range = new Range();
            range.setStart(pos.node ,pos.position);
            selection.addRange(range);
          }
      }
    },
    getTextNodeAtPosition (root, index){
        const NODE_TYPE = NodeFilter.SHOW_TEXT;
        var treeWalker = document.createTreeWalker(root, NODE_TYPE, function next(elem) {
            if(index > elem.textContent.length){
                index -= elem.textContent.length;
                return NodeFilter.FILTER_REJECT
            }
            return NodeFilter.FILTER_ACCEPT;
        });
        var c = treeWalker.nextNode();
        return {
            node: c? c: root,
            position: index
        };
    },
    placeCaretAtEnd () {
      let el = this.$refs.input
      el.focus();
      if (typeof window.getSelection != "undefined"
              && typeof document.createRange != "undefined") {
          var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
      } else if (typeof document.body.createTextRange != "undefined") {
          var textRange = document.body.createTextRange();
          textRange.moveToElementText(el);
          textRange.collapse(false);
          textRange.select();
      }
  }
  },
  updated () {
    if (this.restore) {
      this.restore()
    }
  }
}
</script>

<style scoped>
[placeholder]:empty:before {
  content: attr(placeholder);
  color: var(--color-text-quarternary);
}
</style>