<template>
  <a :href="'/zemla/'+model.id" class="zemla-as-link" @click.prevent="a_click">{{model.name}}</a>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
    mixins:[logMixin],
    name: "zemla-as-link",
    props: ["id", "model"],
    methods: {
      a_click: function (e) {
        Application.getInstance().goTo(this.model)
        StateManager.getInstance().pushState()
      }
    },
    created: function () {
      this.model.joinedLoaded();
    },
  }
</script>

<style scoped>
</style>
