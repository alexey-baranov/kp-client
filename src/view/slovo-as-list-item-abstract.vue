<template>
  <div :id="id" class="slovo-as-list-item-abstract d-flex flex-nowrap align-items-start" :class="{isMy}" style="position: relative;">
    <kopnik-as-avatar v-if="model.owner" style="flex: 0 0 auto" :model="model.owner"/>
    <mu-card class="p-2 slovo-as-list-item-abstract--card" style="flex: 0 1 auto;overflow: hidden;">
      <div class="text-truncate" :style="{marginRight:$slots.right?'2.5em':''}">
        <kopnik-as-link v-if="model.owner" :model="model.owner" class="font-weight-bold"/>
        <span class="kp-small text-muted">{{model.created | humanize}}</span>
      </div>
      <slot name="middle"></slot>
      <div class="" style="position: absolute; top:0; right: 0;">
        <slot name="right"></slot>
      </div>
    </mu-card>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  import KopnikAsAvatar from "./kopnik-as-avatar";
  import humanize from "./mixin/humanize"
  import KopnikAsLink from "./kopnik-as-link";
  let models = require("../model")

  export default  {
    mixins:[logMixin, humanize],
    name: "predlozhenie-as-list-abstract",
    props: ["id", "model"],
    computed:{
      isMy(){
        return this.model.owner && this.model.owner.id== Application.getInstance().user.id
      }
    },
    components: {
      KopnikAsLink,
      KopnikAsAvatar,
    }
  }
</script>

<style scoped>
  /*not isMy*/
  .slovo-as-list-item-abstract:not(.isMy) > div:nth-child(2){
    margin-left: 0.5rem;
  }

  /*isMy*/
  .slovo-as-list-item-abstract.isMy > .kopnik-as-avatar{
    order:1;
  }
  .slovo-as-list-item-abstract.isMy > div:nth-child(2){
    margin-left: auto;
    margin-right: 0.5rem;
  }

</style>
