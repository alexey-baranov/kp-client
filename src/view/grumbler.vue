<template>
  <div v-show="model.errors.length" class="grumbler">
    <mu-dialog titleClass="alert-heading" dialogClass="alert alert-danger" scrollable :open="model.errors.length>0"
               :title="model.currentErrorType"
               @close="close_click">
      <strong class="lead2">{{model.currentErrorMessage}}</strong>
      <!--<pre><small>{{model.currentErrorStack}}</small></pre>-->
      <button class="btn btn-primary" slot="actions" @click="close_click">Закрыть</button>
    </mu-dialog>
  </div>
</template>

<script>
  import Application from '../Application'
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"
  import Grumbler from "../Grumbler"

  export default  {
//    mixins: [logMixin],
    name: "grumbler",
    props: ["id", "model"],
    computed: {
    },
    methods: {
      close_click(e){
        this.model.shiftError()
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
    }
  }
</script>

<style scoped>
</style>
