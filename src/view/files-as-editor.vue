<template>
  <div class="files">
      <div :id="id+'_browse'" href="#" class="browse">Выбрать файлы...</div>
      <ul>
        <li v-for="each in model">
          <file-as-link :model="each"></file-as-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  /**
   * причина по которой нужно разделить files.vue на два, а не использовать однми компонентом
   * с mode="editor" как везде в том что Rrsumable не очень подходит для работы в одностраничных
   * приложениях.
   * Он не умеет детачить свои обработчики когда компонент переходит в режим просмотра
   * и получается что файлы прицепляются в обоих режимах
   * Если же события аттачить к несуществующему в просмотрщике дом элементе
   * например Kopa[mode=editor] #onlyEditorDiv то событие вообще не будет прикреплено
   */
  import Resumable from "resumablejs"

  import Application from "../Application"
  import config from "../../cfg/main"
  import Connection from "../Connection"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"
  import models from "../model"

  export default  {
//    mixins:[require("./mixin/humanize")],
    name: "files",
    components: {
      "file-as-link": require("./file-as-link.vue")
    },
    props: ["id", "model", "mode", "drop"],
    watch:{
        model(cur, prev){
          //this.log.debug("watch model", cur, prev)
          this.loadModel()
        }
    },
    methods: {
        async loadModel(){
          for(let each of this.model){
            await each.joinedLoaded()
          }
        }
    },
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")

      this.loadModel()
    },
    mounted(){
      var r = new Resumable({
        target: `${config["file-server"].schema}://${config["file-server"].host}:${config["file-server"].port}/${config["file-server"]["upload-path"]}`,
        testChunks: false, //http://resumablejs.com/
        query: {
          OWNER: Application.getInstance().user.id,
        }
      })
      if (!r.support) {
        this.log.debug("Fatal: ResumableJS not supported!");
      } else {
        r.assignBrowse(document.getElementById(this.id + '_browse'));

        /*
         //todo: разобраться почему здесь превент дефолт останавливает вызов диалога файла
         document.getElementById(this.id+'_browse').addEventListener('click', function(e){
         e.preventDefault()
         })
         */

        if (this.drop) {
          r.assignDrop(document.getElementById(this.drop))
        }
        r.on('fileAdded', (file) => {
          this.log.debug('fileAdded', file);
          r.upload();
        });
        r.on('fileSuccess', async(file, message) => {
          this.log.debug('fileSuccess', file, message);
          this.log.debug(r.files);
          this.model.push(await models.File.get(JSON.parse(message)))
          // enable repeated upload since other user can delete the file on the server
          // and this user might want to reupload the file
          r.removeFile(file)
        });
        r.on('fileError', (file, message) => {
          this.log.debug('fileError', file, message);
        });

      }
    }
  }
</script>

<style scoped>
  .browse{
    color: blue;
    cursor: pointer;
  }

  .drop {
    height: 60px;
    color: gray;
    border: solid gray 1px
  }

  .drop:hover {
    color: black;
    border-color: black;
  }
</style>
