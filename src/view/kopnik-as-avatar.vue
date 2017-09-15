<template>
  <div class="d-inline-flex">
    <mu-avatar>{{model.name?model.name.substring(0,1):""}}</mu-avatar>
    <slot/>
  </div>
</template>

<script>
  import Application from '../Application'
  import humanize from "./mixin/humanize"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
    mixins: [logMixin, humanize],
    name: "kopnik-as-avatar",
    props: ["id", "model", "target"],
    components:{
      "kopnik-as-link": require("./kopa-as-link.vue")
    },
    methods: {
    },
    created() {
      this.model.joinedLoaded()
    }
  }
</script>

<style scoped>
  .kopnik-as-avatar {
    display: inline-block;
  }
</style>
