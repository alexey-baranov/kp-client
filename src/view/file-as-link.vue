<template>
  <span class="file-as-link d-inline-flex flex-nowrap" style="max-width: 100%">
    <div style="flex: 0 0 auto">
      <slot>
          <mu-icon value="attachment" :size="20"/>
      </slot>
    </div>
    <a style="flex: 0 1 auto" class="text-truncate" :href="model.path | download" target="_blank"  @click.stop="">
      {{model.name}} ({{model.size | humanizeDiskSpase }})
    </a>
    <template v-if="!model.id">
      <mu-icon value="file_upload" :size="20" color="green"/>
      <span class="font-weight-bold text-nowrap" style="color:green;">{{model.uploadProgress | percents}} %</span>
    </template>
    <!--{{model.path}}-->
  </span>
</template>

<script>
  import Application from '../Application'
  import config from '../../cfg/main'
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
    components: {},
    mixins: [require("./mixin/humanize")],
    name: "file-as-link",
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
