<template>
  <a href="#" @click.prevent="a_click" class="kopnik-as-link">{{model.surname}} {{model.name}} {{model.patronymic}}
    <slot></slot>
  </a>
</template>

<script>
  const log = require("loglevel").getLogger("kopnik-as-link.vue")

  import Application from '../Application'
  import StateManager from "../StateManager"

  export default  {
    props: ["id", "model"],
    methods: {
      a_click(e){
        Application.getInstance().goTo(this.model)
        StateManager.getInstance().pushState()
      }
    },
    created: function () {
      this.model.joinedLoaded();
    }
  }
</script>

<style scoped>
</style>
