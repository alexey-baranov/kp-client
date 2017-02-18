<template>
  <a :href="path" class="file-as-link">{{model.name}}
    <slot></slot>
  </a>
</template>

<script>
  import Application from '../Application'
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  let config= require("../../cfg/main")[process.env.NODE_ENV]

  export default  {
//    mixins: [logMixin],
    name: "kopnik-as-link",
    props: ["id", "model", "target"],
    computed:{
      path(){
        let result= `${config["file-server"].schema}://${config["file-server"].host}:${config["file-server"].port}/${config["file-server"]["download-path"]}`
        result+=`?path=${encodeURIComponent(this.model.path)}`
        return result
      },
      canDownload(){
          return this.model.path
      }
    },
    methods: {
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
    }
  }
</script>

<style scoped>
</style>
