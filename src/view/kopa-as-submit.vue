<template>
  <div :id="id" class="kopa-as-submit card" :class="{'kopa-as-submit--empty': !model.question}">
    <div class="card-body">
      <mu-text-field class="my-0" fullWidth multiLine hintText="Созвать всех на копу по вопросу..." :rows="2"
                     :rowsMax="5" v-model="model.question" @keyup.native.ctrl.enter="submit_click"/>
      <files :id="id+'_files' " mode="editor" :model="model.attachments"></files>
      <button class="btn btn-block btn-secondary mt-2" @click="draft_click">Да черновик</button>
      <button class="btn btn-block btn-primary mt-2" @click="submit_click">Созвать копу (Ctrl+Ввод)</button>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  let models = require("../model");

  export default {
//    mixins:[logMixin],
    name: "kopa-as-submit",
    data(){
      return {}
    },
    props: ["id", "model"],
    watch: {
      async model(){
        await this.onModel()
      }
    },
    computed: {},
    methods: {
      submit_click(){
        if (this.model.question) {
          this.$emit("submit", this)
        }
      },
      draft_click(){
        this.$emit("draft", this)
      },
      async onModel(){
        await
        this.model.place.joinedLoaded()
      }
    },
    components: {
      "files": require("./files.vue"),
    },
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      await this.onModel()
    },
  }
</script>

<style scoped>
  .kopa-as-submit textarea {
    height: 6em;
  }

  .kopa-as-submit--empty textarea {
    height: 2.5em;
  }

  .kopa-as-submit--empty button {
    display: none;
  }

  .kopa-as-submit--empty .files {
    display: none;
  }
</style>
