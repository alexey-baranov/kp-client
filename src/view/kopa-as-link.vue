<template>
  <span class="kopa-as-link">
    <a :href="'?body=Kopa:'+model.id" class="kopa-as-link" :target="target" @click="a_click">{{model.name}}
      <slot></slot>
    </a>
  </span>
</template>

<script>
  import Application from '../Application'
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
//    mixins: [logMixin],
    name: "kopa-as-link",
    props: ["id", "model", "target"],
    methods: {
      a_click(e){
//        debugger
        e.stopPropagation()
        if (this.target != '_blank') {
          Application.getInstance().goTo(this.model)
          StateManager.getInstance().pushState()
          e.preventDefault()
        }
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      this.model.joinedLoaded();
    }
  }
</script>

<style scoped>
</style>
