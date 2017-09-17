<template>
  <div :id="id" class="slovo-as-submit mu-card"
       :class="{'slovo-as-submit--empty': !model.value}">
    <div class="d-flex align-items-stretch flex-nowrap">
      <mu-icon-button ref="more" icon="more_vert"
                      :anchorOrigin="{horizontal: 'left', vertical: 'top'}"
                      :targetOrigin="{horizontal: 'left', vertical: 'bottom'}" @click="more_toggle">
      </mu-icon-button>

      <mu-popover :open="more_open" :autoPosition="false" :trigger="more_trigger"
                  :anchorOrigin="{vertical: 'top',horizontal: 'left'}"
                  :targetOrigin="{vertical: 'bottom',horizontal: 'left'}" @close="more_close">
        <mu-menu>
          <mu-menu-item title="Поставить на голосоване" :disabled="!model.value" @click="predlozhenie_click"/>
        </mu-menu>
      </mu-popover>
      <mu-text-field class="mt-3" fullWidth multiLine hintText="Говорите..." :rows="1" :rowsMax="5"
                     v-model="model.value" @keyup.native.ctrl.enter="submit_click"/>
      <mu-icon-button ref="attach" primary icon="attachment" @clickX="attachment_click"/>
      <mu-icon-button primary icon="done" :disabled="!model.value" @click="submit_click"/>
    </div>
    <files v-show="model.attachments && model.attachments.length" ref="files" :id="id+'_upload'" class="mt-0 w-100"
           mode="editor" :model="model.attachments"></files>
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
        more_trigger: null,
        more_open: false,
        open: false,
        trigger: null
      }
    },
    props: ["id", "model"],
    methods: {
      more_toggle(){
        this.more_open = !this.more_open
      },
      more_close(){
        this.more_open = false
      },
      attachment_click(){
        let input = document.createElement('input');
        input.type = 'file';
        input.click();
      },
      submit_click(){
        if (this.model.value) {
          this.$emit("submit", this)
        }
      },
      predlozhenie_click(){
        this.open = false
        this.$emit("predlozhenie", this)
      },
    },
    components: {
      "files": require("./files.vue")
    },
    created: async function () {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
    },
    async mounted(){
      this.more_trigger = this.$refs.more.$el
      this.$refs.files.r.assignBrowse(this.$refs.attach.$el)
    },
  }
</script>

<style>

</style>
