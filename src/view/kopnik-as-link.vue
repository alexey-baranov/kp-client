<template>
  <a href="#" @click.prevent="a_click" class="kopnik-as-link">{{model.surname}} {{model.name}} {{model.patronymic}}
    <slot></slot>
  </a>
</template>

<script>
  import Application from '../Application'
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"


  export default  {
    mixins:[logMixin],
    name:"kopnik-as-link",
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
