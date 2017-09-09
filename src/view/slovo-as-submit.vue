<template>
  <div :id="id" class="slovo-as-submit card"
       :class="{'slovo-as-submit--empty': !model.value}">
    <div class="card-body">
      <files :id="id+'_upload'" class="mt-0" mode="editor" :model="model.attachments"></files>
      <mu-text-field class="my-0" fullWidth multiLine hintText="Говорите..." :rows="1" :rowsMax="5"
                     v-model="model.value" @keyup.native.ctrl.enter="submit_click"/>
      <div class="d-flex">
        <mu-raised-button style="flex-grow:1" label="Сказать" primary :disabled="!model.value" @click="submit_click"/>
        <mu-raised-button ref="button" primary label="..." :disabled="!model.value" @click="toggle"/>
        <mu-popover :trigger="trigger" :open="open" :anchorOrigin="{vertical: 'top',horizontal: 'right'}"
                    :targetOrigin="{vertical: 'bottom',horizontal: 'right'}" @close="handleClose">
          <mu-menu>
            <mu-menu-item title="Поставить на голосование" @click="predlozhenie_click"/>
          </mu-menu>
        </mu-popover>
      </div>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  let models = require("../model")

  export default  {
//    mixins:[logMixin],
    name: "slovo-as-submit",
    data () {
      return {
        open: false,
        trigger: null
      }
    },
    props: ["id", "model"],
    methods: {
      submit_click(){
        if (this.model.value) {
          this.$emit("submit", this)
        }
      },
      predlozhenie_click(){
        this.open = false
        this.$emit("predlozhenie", this)
      },
      toggle () {
        this.open = !this.open
      },
      handleClose (e) {
        this.open = false
      },
    },
    components: {
      "files": require("./files.vue")
    },
    created: async function () {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
    },
    async mounted(){
      this.trigger = this.$refs.button.$el
    },
  }
</script>

<style scoped>

  .slovo-as-submit textarea {
    height: 4em;
  }

  /*  .slovo-as-submit .files{
      background: white;
    }*/

  .slovo-as-submit--empty textarea {
    height: 2.5em;
  }

  .slovo-as-submit--empty button {
    /*display: none;*/
  }

  .slovo-as-submit--empty .files {
    display: none;
  }
</style>
