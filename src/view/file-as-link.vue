<template>
  <span>
    <slot>
      <i class="material-icons md-dark md-1em">attachment</i>
    </slot>
    <a :href="pathFromData" class="file-as-link" @click.stop="">
      {{model.name}} ({{model.size | humanizeDiskSpase }}) <!--{{model.path}}-->
    </a>
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
    data(){
      /**
       * замена computed.path который почему то не реактивится после загрузки файла
       */
      return {pathFromData: undefined}
    },
    props: ["id", "model", "target"],
    computed: {
      path(){
        let result = `${config["file-server"].schema}://${config["file-server"].host}:${config["file-server"].port}/${config["file-server"]["download-path"]}`
        result += `?path=${encodeURIComponent(this.model.path)}`
        return result
      },
      canDownload(){
        return this.model.path
      }
    },
    methods: {},
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      await
      this.model.joinedLoaded()
      this.pathFromData = this.path
    }
  }
</script>

<style scoped>
</style>
