<template>
  <mu-card :id="id" class="slovo-as-list-item-abstract d-flex flex-nowrap align-items-start">
    <kopnik-as-avatar v-if="model.owner" class="ml-3 my-3" style="min-width:40px;" :model="model.owner"/>
    <div class="p-3" style="flex-grow: 1;">
      <kopnik-as-link v-if="model.owner" :model="model.owner" class="mu-card-header p-0 d-block" />
      <slot name="middle"></slot>
    </div>
    <div class="my-3 mr-3">
      <slot name="right"></slot>
    </div>
  </mu-card>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  import KopnikAsAvatar from "./kopnik-as-avatar";
  let models = require("../model")

  export default  {
    mixins:[logMixin],
    name: "predlozhenie-as-list-abstract",
    props: ["id", "model"],
    components: {
      KopnikAsAvatar,
      "kopnik-as-link": require("./kopnik-as-link.vue"),
    }
  }
</script>

<style scoped>
  .slovo-as-list-item-abstract {

  }
</style>
