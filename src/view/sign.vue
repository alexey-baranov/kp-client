<template>
  <kopnik-as-avatar :model="owner" :target="target">
    <div>
      <kopnik-as-link class="font-weight-bold" :model="owner" :target="target"></kopnik-as-link>
    </div>
    <div class="text-muted">
      {{date | humanize}}
    </div>
  </kopnik-as-avatar>
</template>

<script>
  import Application from '../Application'
  import humanize from "./mixin/humanize"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
    mixins: [logMixin, humanize],
    name: "sign",
    props: ["id", "owner", "date", "target", "hideAvatar"],
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue"),
      "kopnik-as-avatar": require("./kopnik-as-avatar.vue")
    },
    methods: {},
    created() {
      this.owner.joinedLoaded()
    }
  }
</script>

<style scoped>
  .sign {
    /*display: inline-block;*/
  }
</style>
