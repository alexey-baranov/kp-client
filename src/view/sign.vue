<template>
  <div class="sign" :id="id" style="white-space: nowrap; overflow: hidden;">
    <kopnik-as-avatar v-if="!hideAvatar" :model="owner" :target="target"/>
    <div class="mu-card-header-title pr-0">
      <div class="mu-card-title">
        <kopnik-as-link :model="owner" :target="target"></kopnik-as-link>
      </div>
      <div class="mu-card-sub-title">
        {{date | humanize}}
      </div>
    </div>
  </div>
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
