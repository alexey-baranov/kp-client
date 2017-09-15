<template>
  <div :id="id" class="slovo-as-list-item-abstract d-flex flex-nowrap align-items-start" style="position: relative;">
    <kopnik-as-avatar v-if="model.owner" class="mr-2 mt-2" style="min-width:40px;" :model="model.owner"/>
    <mu-card class="p-3">
      <kopnik-as-link v-if="model.owner" :model="model.owner" class="d-block font-weight-bold" :style="{marginRight:$slots.right?'2.5em':''}"/>
      <slot name="middle"></slot>
      <div class="" style="position: absolute; top:0; right: 0;">
        <slot name="right"></slot>
      </div>
      <div class="kp-small text-muted">
        {{model.created | humanize}}
      </div>
    </mu-card>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  import KopnikAsAvatar from "./kopnik-as-avatar";
  import Sign from "./sign";
  import humanize from "./mixin/humanize"
  let models = require("../model")

  export default  {
    mixins:[logMixin, humanize],
    name: "predlozhenie-as-list-abstract",
    props: ["id", "model"],
    components: {
      Sign,
      KopnikAsAvatar,
      "kopnik-as-link": require("./kopnik-as-link.vue"),
    }
  }
</script>

<style scoped>
  .slovo-as-list-item-abstract {

  }
</style>
