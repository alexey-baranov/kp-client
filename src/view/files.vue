<template>
  <div class="files" :class="{'files-not-empty': model.length}">
    <div v-show="mode == 'editor'" ref="drop" :id="id+'_drop'" class="drop">
      <div class="row mx-0">
        <div class="col-12">
          <slot name="welcome">
            <div class="welcome">
              <mu-icon value="attachment"/> Выбрать файлы...
            </div>
          </slot>
        </div>
        <div v-for="eachFile in model" class="col-12">
          <file-as-link  :model="eachFile">
            <mu-icon value="remove_circle" color="red" style="cursor: pointer;" @click.stop="remove_click(eachFile)" :size="20"></mu-icon>
          </file-as-link>
        </div>
      </div>
    </div>
    <div v-if="mode != 'editor' ">
      <div class="row mx-0">
        <div v-for="eachFile in model" class="col-12 col-sm-6 text-truncate">
          <file-as-link  :model="eachFile"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Resumable from "resumablejs"

  import Application from "../Application"
  import config from "../../cfg/main"
  import Connection from "../Connection"
  import Grumbler from "../Grumbler"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"
  import models from "../model"


  let chunkSize = 25 * 1024 * 1024

  export default  {
    mixins:[require("./mixin/humanize"), require("./mixin/log"), ],
    name: "files",
    components: {
      "file-as-link": require("./file-as-link.vue")
    },
    props: ["id", "model", "mode", "drop"],
    watch: {
      mode(current, prev){
        if (current == "view") {
          this.cancelUpload()
        }
      },
      model(current, prev){
        if (current != prev) {
          this.cancelUpload(prev)
        }
      }
    },
    methods: {
      getFileByResumable(resumable){
        let result = this.model.find(each => each.resumable == resumable)
        return result
      },
      async remove_click(file){
        if (file.resumable) {
          file.resumable.cancel()
        }
        let FILE = this.model.indexOf(file)
        this.model.splice(FILE, 1)
      },
      /**
       * отменить все закачки, которые сейчас идут или в очереди
       *
       * @param {Array} model массив[models.File] нужен затем что внутри watch.model() значение this.model уже будет указывать на новую модель
       *
       */
      cancelUpload(model = this.model){
        if (this.r) {
          for (let eachResumable of this.r.files) {
            this.log.debug("canceling ", eachResumable.fileName, eachResumable)
            let file = model.find(eachFile => eachFile.resumable == eachResumable)
            if (file) {
              model.splice(model.indexOf(file), 1)
            }
            else {
              this.log.warn("can't find models.File for resumable", eachResumable.fileName)
            }
          }
          this.r.cancel()
        }
      }
    },
    async created() {
//        this.loadModel()
    },
    mounted(){
      this.r = new Resumable({
        target: `${config["file-server"].schema}://${config["file-server"].host}:${config["file-server"].port}/${config["file-server"]["upload-path"]}`,
        chunkSize,
        testChunks: false, //http://resumablejs.com/
        query: {
          OWNER: Application.getInstance().user.id,
        }
      })
      if (!this.r.support) {
        throw new Error("Fatal: ResumableJS not supported!")
      }
        this.r.assignBrowse(this.$refs.drop)

        /*
         //todo: разобраться почему здесь превент дефолт останавливает вызов диалога файла
         document.getElementById(this.id+'_browse').addEventListener('click', function(e){
         e.preventDefault()
         })
         */

        this.r.assignDrop(this.$refs.drop)

        this.r.on('fileAdded', (resumable) => {
          this.log.debug('fileAdded', resumable)

          if (resumable.size > chunkSize) {
            this.r.removeFile(resumable)
            Grumbler.getInstance().pushError(`"Размер файла не может превышать ${chunkSize / 1024 / 1024} Мб`)
          }
          else {
            let file = new models.File()
            file.name = resumable.fileName
            file.size = resumable.size
            file.resumable = resumable

            this.model.push(file)
            this.r.upload()
          }
        })
        this.r.on('fileProgress', (resumable) => {
          this.log.debug('fileProgress', resumable)

          let file = this.getFileByResumable(resumable)
          if (file) {
            file.uploadProgress = resumable.progress();
          }
        })
        this.r.on('fileSuccess', async(resumable, message) => {
          this.log.debug('fileSuccess', resumable, message)

          let fileAsPlain = JSON.parse(message)

          let file = this.getFileByResumable(resumable)
          let FILE = this.model.indexOf(file)
          file = await models.File.get(fileAsPlain)

          this.model.splice(FILE, 1, file)

//          this.model.push(await models.File.get(JSON.parse(message)))
          // enable repeated upload since other user can delete the file on the server
          // and this user might want to reupload the file
          this.r.removeFile(resumable)
        })
        this.r.on('fileError', (value, message) => {
          this.log.error('fileError', value, message);

          Grumbler.getInstance().pushError(message)
        })
    },
    beforeDestroy(){
      this.cancelUpload()
    }
  }
</script>

<style scoped>
  .files-not-empty{
    background: #f7f7f9;
  }
  .drop:hover {
    background: #f7f7f9;
  }


  .browse {
    cursor: pointer;
  }

  .browse:hover .browse--message{
    color: blue;
  }
</style>
