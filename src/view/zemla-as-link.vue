<template>
  <a :href="'?body=Zemla:'+model.id" class="zemla-as-link" :target="target" @click="a_click">{{model.name}}</a>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
//    mixins:[logMixin],
    name: "zemla-as-link",
    props: ["id", "model", "target"],
    methods: {
      async a_click(e) {
//        e.stopPropagation()
        if (this.target != '_blank') {
          Application.getInstance().goTo(this.model, true)
          await Promise.resolve()
          StateManager.getInstance().pushState()
          e.preventDefault()
        }
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
      this.model.joinedLoaded();
    },
  }
</script>

<style scoped>
</style>
