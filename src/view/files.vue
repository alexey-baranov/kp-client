<template>
  <div class="files px-1 py-1">
    <div v-show="mode == 'editor'" :id="id+'_drop'" class="drop">
      <div :id="id+'_browse'" href="#" class="browse" @click="">Выбрать файлы...
        <ul class="list-group flex-row row">
          <li v-for="eachFile in model" class="list-group-item border-0 bg-none  col-12 col-md-6 col-xl-4">
            <file-as-link :model="eachFile">
              <i class="material-icons md-dark md-1em" @click.stop="remove_click(eachFile)">remove_circle</i>
            </file-as-link>
          </li>
        </ul>
      </div>
    </div>
    <template v-if="mode != 'editor' ">
      <ul v-if="model.length" class="list-group flex-row row">
        <li v-for="eachFile in model" class="list-group-item border-0 col-12 col-md-6 col-xl-4">
          <file-as-link :model="eachFile"></file-as-link>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
  import Resumable from "resumablejs"

  import Application from "../Application"
  import Connection from "../Connection"
  import Grumbler from "../Grumbler"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"
  import models from "../model"


  let config = require("../../cfg/main")[process.env.NODE_ENV]
  let chunkSize = 25 * 1024 * 1024

  export default  {
//    mixins:[require("./mixin/humanize")],
    name: "files",
    components: {
      "file-as-link": require("./file-as-link.vue")
    },
    props: ["id", "model", "mode", "drop"],
    watch: {
      model(cur, prev){
//        this.loadModel()
      },
    },
    methods: {
      async remove_click(file){
          if (file.resumable){
              file.resumable.cancel()
          }
        let FILE = this.model.indexOf(file)
        this.model.splice(FILE, 1)
      },
    },
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")

//      this.loadModel()
    },
    mounted(){
      var r = new Resumable({
        target: `${config["file-server"].schema}://${config["file-server"].host}:${config["file-server"].port}/${config["file-server"]["upload-path"]}`,
        chunkSize,
        testChunks: false, //http://resumablejs.com/
        query: {
          OWNER: Application.getInstance().user.id,
        }
      })
      if (!r.support) {
        this.log.error("Fatal: ResumableJS not supported!")
      }
      else {
        r.assignBrowse(document.getElementById(this.id + '_browse'));

        /*
         //todo: разобраться почему здесь превент дефолт останавливает вызов диалога файла
         document.getElementById(this.id+'_browse').addEventListener('click', function(e){
         e.preventDefault()
         })
         */

        r.assignDrop(document.getElementById(this.id + '_drop'));

        r.on('fileAdded', (value) => {
          this.log.debug('fileAdded', value);

          if (value.size > chunkSize) {
            r.removeFile(value)
            Grumbler.getInstance().pushError(`"Размер файла не может превышать ${chunkSize / 1024 / 1024} Мб`)
          }
          else {
            let file= new models.File()
            file.name= value.fileName
            file.size= value.size
            file.resumable= value

            this.model.push(file)
            r.upload()
          }
        });
        r.on('fileProgress', (value) => {
          this.log.debug('fileProgress', value);

          let file= this.model.find(each=>each.resumable== value)
          file.uploadProgress= value.progress()
        })
        r.on('fileSuccess', async(value, message) => {
          this.log.debug('fileSuccess', value, message);

          let fileAsPlain= JSON.parse(message)

          let file= this.model.find(each=>each.resumable== value)
          file.id= fileAsPlain.id
          file.merge(fileAsPlain)
//          this.model.push(await models.File.get(JSON.parse(message)))
          // enable repeated upload since other user can delete the file on the server
          // and this user might want to reupload the file
          r.removeFile(value)
        });
        r.on('fileError', (value, message) => {
          this.log.debug('fileError', value, message);

          Grumbler.getInstance().pushError(message)
        })
      }
    }
  }
</script>

<style scoped>
  .browse {
    color: blue;
    cursor: pointer;
  }

  .drop {
    border: solid lightgray 1px;
  }

  .drop:hover {
    background: #f7f7f9;
    /*background-image: url(/static/material-icons/ic_attachment_black_48px.svg);*/
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
  }
</style>
