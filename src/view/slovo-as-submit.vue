<template>
  <div :id="id" class="slovo-as-submit card  border-right-0 border-left-0 border-bottom-0" :class="{'slovo-as-submit--empty': !model.value}">
    <div class="card-block">
      <textarea class="form-control" v-model="model.value"
                placeholder="Говорите..." @keyup.ctrl.enter="submit_click"> </textarea>
      <files :id="id+'_upload'" mode="editor" :model="model.attachments"></files>
      <button class="btn btn-block btn-primary mt-2" :disabled="!model.value" @click="submit_click">Сказать
        (Ctrl+Ввод)
      </button>
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
    props: ["id", "model"],
    methods: {
      submit_click(){
        this.$emit("submit", this)
      }
    },
    components: {
      "files": require("./files.vue")
    },
    created: async function () {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
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
    display: none;
  }
  .slovo-as-submit--empty .files {
    display: none;
  }
</style>
