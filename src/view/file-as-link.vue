<template>
  <span>
    <slot>
      <i class="material-icons md-dark md-1em">attachment</i>
    </slot>
    <a :href="model.path | download" class="file-as-link" @click.stop="">
      {{model.name}} ({{model.size | humanizeDiskSpase }})
    </a>

    <span v-if="!model.id" class="text-nowrap">
      <i class="material-icons">file_upload</i> {{model.uploadProgress | percents}} %
    </span>
    <!--{{model.path}}-->
  </span>
</template>

<script>
  import Application from '../Application'
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  let config = require("../../cfg/main")[process.env.NODE_ENV]

  export default  {
    mixins: [require("./mixin/humanize")],
    name: "kopnik-as-link",
    props: ["id", "model", "target"],
    filters:{
      download(value){
        let result = `${config["file-server"].schema}://${config["file-server"].host}:${config["file-server"].port}/${config["file-server"]["download-path"]}`
        result += `?path=${encodeURIComponent(value)}`
        return result
      }
    },
    watch: {},
    computed: {
      canDownload(){
        return this.model.path
      }
    },
    methods: {},
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      if (this.model.id) {
        await this.model.joinedLoaded()
      }
    }
  }
</script>

<style scoped>
</style>
