<template>
  <span class="file-as-link">
    <slot>
      <i class="material-icons md-dark md-1em">attachment</i>
    </slot>
    <a :href="model.path | download" target="_blank" class="file-as-link" @click.stop="">
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
  import config from '../../cfg/main'
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
    mixins: [require("./mixin/humanize")],
    name: "kopnik-as-link",
    props: ["id", "model", "target"],
    filters: {
      /**
       * url на скачивание по пути файла
       * computed не срабатывает, поэтому делаем тоже самое чере filter
       * @param value
       * @return {string}
       */
      download(value){
        if (!value) {
          return null
        }
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
  .card-inverse .file-as-link {
    color: rgb(255, 255, 255)
  }
</style>
