<template>
  <div class="application">
    <grumbler :model="grumbler"></grumbler>
    <mu-toast v-if="notifier.currentNotification" :message="notifier.currentNotification.value" @close="toast_close"/>

    <mu-appbar id="appbar" class="sticky-top"
               :title="'kopnik.org '+ ((!model.user && model.section!='registration')?'Вход':model.header)">
      <mu-icon-button icon='menu' @click="appbar_click()" slot="left"/>
      <!--<mu-icon-button icon='expand_more' slot="right"/>-->
    </mu-appbar>
    <div class="row no-gutters flex-nowrap container-under-navbar mx-auto">
      <sidebar v-if="model.user && model.section!='registration'" :application="model" :open="sidebar_open" :docked="false" @close="sidebar_close"></sidebar>
      <div class="col-12">
        <div class="container-fluid">
          <div v-if="model.pushSubscription===null" class="alert alert-warning">
            Вы заблокировали оповещения. Все подробности <a
            href="https://www.youtube.com/watch?v=Zo77aWoW_vc&index=4&list=PL8t968Ip0ARlvJj1gAUQCjPNzOORGIMTR">здесь</a>
          </div>
          <cookie-auth v-if="model.cookieAuth"></cookie-auth>
          <auth v-if="!model.cookieAuth && !model.user && model.section!='registration'" @input="auth_input"></auth>
          <registration-as-form v-if="model.section=='registration'" :id="id+'_registration'"
                                @close="registration_close"></registration-as-form>
          <template v-if="model.user">
            <kopnik-as-verifier v-if="model.section=='verification'" :id="id+'_verification'"
                                :model="model.user"></kopnik-as-verifier>
            <div v-if="model.section=='main' && model.body">
              <!--<h1 class="title text-truncate">{{header}}</h1>-->
              <location class="breadcrumb" style="background: none;" :model="model.body" full="true"></location>
              <!--с overflow=hidden не ааботает sticky-bottom для слова в копе-->
              <component ref="bodyView" v-bind:is="bodyType" :id="id+'_body'" :model="model.body" class="kp-overflow-hiddenX"></component>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  let $ = require("jquery")
  import Vue from "vue"
  import SlovoAsListItem from "./slovo-as-list-item";
  import Sidebar from "./sidebar";
  import Files from "./files.vue";
  import CookieAuth from "./cookie-auth";

  import Application from "../Application"
  import logMixin from "./mixin/log"
  import Notifier from "../Notifier"
  import Grumbler from "../Grumbler"
  import StateManager from "../StateManager"
  import Connection from "../Connection"

  export default{
    name: "application",
//    mixins:[logMixin], выдает ошибку
    data(){
      return {
          tempSlovo: models.Slovo.getReference(1),
        sidebar_open: false,
        sidebar_docked: true,
        logMessage: null,
        notifier: Notifier.getInstance(),
        grumbler: Grumbler.getInstance(),
      }
    },
    props: ["id", "model"],
    watch: {
      "model.user": async function () {
        this.log.debug("user watcher...")
        if (this.model.user) {
          await this.model.user.joinedLoaded()
          await this.model.user.reloadRegistrations()
        }
        else {
          this.userDoma = null
        }
      },
      "model.body": async function (current, prev) {
        if (current) {
          if (!(this.model.body instanceof models.RemoteModel)) {
            throw new Error("Неверный тип тела")
          }
          await this.model.body.joinedLoaded()
        }
      }
    },
    components: {
      SlovoAsListItem,
      Files,
      Sidebar,
      CookieAuth,
      "auth": require('./auth.vue'),
      "grumbler": require('./grumbler.vue'),
      "registration-as-form": require('./registration-as-form.vue'),
      "zemla": require('./zemla.vue'),
      "kopa": require('./kopa.vue'),
      "kopnik": require('./kopnik.vue'),
      "zemla-as-link": require('./zemla-as-link.vue'),
      "location": require('./location.vue'),
      "kopnik-as-verifier": require('./kopnik-as-verifier.vue'),
    },
    computed: {
      bodyType(){
        let result = this.model.body.constructor.name.toLocaleLowerCase()

        return result
      },
    },
    methods: {
      setupSidebarDocked(){
        this.log.debug("sidebarr_docked", this.sidebar_docked = $(document.body).width() >= 576)
      },
      sidebar_close(){
        this.sidebar_open = false
      },
      appbar_click(){
        this.sidebar_open = !this.sidebar_open
      },
      async model_restoreScrollItem(){
        setImmediate(() => {
          this.$refs.bodyView.setScrollItem(this.model.body.scrollItem)
        })
      },
      async model_serviceWorkerMessage(event){
        let data = event.data
        switch (event.data.eventType) {
          case "kopaAdd":

            StateManager.getInstance().pushState()
            break
          case "predlozhenieAdd":
          case "slovoAdd":
            let type = event.data.eventType.match(/(.+)Add/)[1],
              Type = type[0].toUpperCase() + type.substr(1)
            await Promise.resolve()
            await this.$refs.bodyView.setScrollItem(models[Type].getReference(data.model.id))
            StateManager.getInstance().pushState()
            break
        }
      },
      registration_close(){
        this.model.setSection(Application.Section.Main)
        StateManager.getInstance().pushState()
      },
      toast_close(){
      },
      /**
       *
       * @param credentials {email, password, captchaResponse}
       */
      auth_input: async function (credentials) {
        try {
          await this.model.authAsPromise(credentials.email, credentials.password, credentials.captchaResponse)
        }
        catch (err) {
          //ошибка теперь отображается в application.on("connectionClose" ) в main.js
          //this.grumbler.pushError(err)
        }
      },
      /**
       * асинк потому что изменения в пользовательском интерфейсе вуи
       * происходят на следующий тик
       */
      getState(){
        let result = {
          drawer: this.drawer
        }
        if (this.model.section == Application.Section.Main && this.model.body) {
          result.body = this.$refs.bodyView.getState()
        }
        return result
      },
      async setState(state){
        this.log.debug("state", state)
        if (!state) {
          state = {};
        }
        /*
         let prevDrawer= this.drawer
         */

        /*
         чтобы во время перехода назад панелька не выскакивала
         */
//        this.drawer = state.drawer
        /*
         if (this.drawer && !prevDrawer){
         this.setSidebarHeight()
         }
         */
        await Promise.resolve(1)
        if (this.model.section == Application.Section.Main) {
          await this.$refs.bodyView.setState(state.body || {})
        }
      },
      debug(){
        this.log.debug.bind(log).apply(arguments)
      },
    },
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      this.model.on("serviceWorkerMessage", this.model_serviceWorkerMessage.bind(this))
      this.model.on("restoreScrollItem", this.model_restoreScrollItem.bind(this))

      /*
       * мобильные браузеры отваливаются после сна, даже не выплюнув событие Connection.onclose
       * поэтому тут этот момент проверяется
       */
      document.addEventListener("visibilitychange", this.document_visibilitychange = async () => {
        console.log("document.hidden", document.hidden)
        /**
         * окно появилось, session вроде активна, но в мобильных браузерах это не факт
         * надо проверить ее любым пингом
         */
        if (!document.hidden && this.model.user) {
          try {
            Connection.getInstance().recheckAfterResume = true
            await Connection.getInstance().session.call("api:pingPong", [new Date()])
          }
          catch (err) {
            this.log.info("pingPong after app resume error", err)
            this.model.cookieAuth= true
          }
        }
      })
    },
    mounted() {
      /**
       * решил уйти на хэши
       * такой метод более универсально при передаче ссылки с урстройства на устройства с разными форматами экрана
       */
      let deb = _.debounce((e) => {
        /**
         * после выхода происходит непроизвольный скрол на странице ввтоиизации
         * который провацирутт пустой запись пустого стейта. поэтоуу тут проверочка
         */
        if (this.model.user) {
            let state = StateManager.getInstance().replaceState()
          }
      }, 500, {maxWait: 500})

      window.addEventListener('scroll', (e) => {
        deb(e)
      })

      this.setupSidebarDocked()
/*
      if (this.sidebar_docked){
          this.sidebar_open=true
      }
*/
      window.addEventListener('resize', this.setupSidebarDocked.bind(this))
    },
    async beforeDestroy(){
    }
  }
</script>

<style scoped>
  .application {

  }

  .container-under-navbar {
    max-width: 960px;
  }
</style>

<style>
  /*fix muse-ui small fants*/
  html {
    /*font-size: 100%;*/
    /*
    андроид хрому все равно на это
    font-size: 16px;
    */
  }

   .mu-text-field {
     min-height: auto;
   }

  /*fix muse-ui position:sticky bug at https://github.com/museui/muse-ui/issues/453#issuecomment-298628883*/
  body, html {
    overflow: visible;
    /*background: #d4edda;*/
    background: rgb(239,239,239);
  }

  body{
    overflow-y: scroll !important;
  }

  .mu-text-field-content {
    padding-top: 0;
    padding-bottom: 0;
  }

  .kp-small {
    font-size: 0.8rem;
  }

  .kp-font-size-smaller, .kp-smaller {
    font-size: smaller;
  }

  .material-icons.md-1em {
    font-size: 1em;
  }

  .material-icons.md-dark {
    color: rgba(0, 0, 0, 0.54);
  }

  .material-icons.md-dark.md-inactive {
    color: rgba(0, 0, 0, 0.26);
  }

  .bg-none {
    background: none;
  }

  .text-pre {
    white-space: pre-wrap;
  }

  a.kp-no-color {
    color: inherit;
  }

  a.kp-no-color :hover {
    color: inherit !important;
  }

  /**
   * то так то эдак работает в мобильном хроме
   * то 16 то 18.4 px дает
  .kp-no-font-size {
    font-size: inherit;
  }
   */

  .kp-pos-fixed {
    position: fixed;
  }

  .kp-pos-sticky {
    position: sticky;
  }

  .kp-overflow-hidden{
    overflow: hidden;
  }
</style>
