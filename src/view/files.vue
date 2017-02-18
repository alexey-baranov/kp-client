<template>
  <div class="files">
    <template v-show="mode=='editor'">
      <div href="#" :id="id+'_browse'" class="browse">
        <div :id="id+'_drop'" class="drop mt-2 d-flex justify-content-center align-items-center">Перенесите сюда файлы
          для загрузки
        </div>
      </div>
      <ul>
        <li v-for="each in model">
          <file-as-link :model="each"></file-as-link>
        </li>
      </ul>
    </template>
    <template v-if="mode != 'editor' ">
      <div v-if="model && model.length" class="download">
        <ul>
          <li v-for="each in model">
            <file-as-link :model="each"></file-as-link>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script>
  import Resumable from "resumablejs"

  import Application from "../Application"
  import Connection from "../Connection"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"
  import models from "../model"


  let config = require("../../cfg/main")[process.env.NODE_ENV]

  export default  {
//    mixins:[logMixin],
    name: "files",
    components: {
      "file-as-link": require("./file-as-link.vue")
    },
    props: ["id", "model", "mode"],
    methods: {},
    created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
    },
    mounted(){
      var r = new Resumable({
        target: `${config["file-server"].schema}://${config["file-server"].host}:${config["file-server"].port}/${config["file-server"]["upload-path"]}`,
//        chunkSize: 1 * 1024 * 1024,
//        forceChunkSize: true, // https://github.com/23/resumable.js/issues/51
//        simultaneousUploads: 4,
        testChunks: false, //http://resumablejs.com/
        query: {
//          SESSION: Connection.getInstance().session.id,
          OWNER: Application.getInstance().user.id,
        }
      });
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

        r.assignDrop(document.getElementById(this.id + '_drop'));
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
  .drop {
    height: 60px;
    color: gray;
    border: solid gray 1px
  }

  .drop:hover {
    color: black;
    border-color: black;
  }

  a:hover {
    text-decoration: none;
  }
</style>
