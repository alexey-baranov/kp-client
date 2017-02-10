<template>
  <ul class="kopa-list">
    <kopa-as-list-item v-for="eachKopa of model2.kopi" :model="eachKopa"></kopa-as-list-item>
  </ul>
</template>

<script>
  let models = require("../model");
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default{
//    mixins:[logMixin],
    name: "zemla-as-kopa-list",
    props: ["id", "model"],
    components: {
      "kopa-as-list-item": require("./kopa-as-list-item.vue")
    },
    watch: {
      $route(){
        this.reloadModel();
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
      this.reloadModel();
    },
    computed: {
      model2(){
        if (!this.model && this.$route.params.ZEMLA) {
          return models.Zemla.getReference(this.$route.params.ZEMLA)
        }
        else {
          return this.model;
        }
      }
    },
    methods: {
      reloadModel: async function () {
//                await this.model2.joinedLoaded();
        if (!this.model2.kopi) {
          await this.model2.loadKopi();
        }
      }
    }
  }
</script>


<style scopedd>
</style>
