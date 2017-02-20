<template>
  <span class="kopnik-as-link">
    <a :href="'/?body=Kopnik:'+model.id" class="kopnik-as-link" :target="target" @click="a_click">{{model.surname}}
      {{model.name}} {{model.patronymic}}
      <small v-if="model.voiskoSize">(+{{model.voiskoSize}})</small>
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
    name: "kopnik-as-link",
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
  .card-inverse .kopnik-as-link {
    color: rgb(255, 255, 255)
  }
</style>
