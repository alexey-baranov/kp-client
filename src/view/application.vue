<template>
  <div class="application">
    <small id="log" class="" style="z-index: 100000; position: fixed; left:0; top:0;">{{logMessage}}</small>
    <grumbler :model="grumbler"></grumbler>
    <mu-toast v-if="notifier.currentNotification" :message="notifier.currentNotification.value" @close="toast_close"/>

    <mu-appbar class="fixed-top"
               :title="'kopnik.org '+ ((!model.user && model.section!='registration')?'Вход':model.header)">
      <mu-icon-button icon='menu' @click="toggle()" slot="left"/>
      <!--<mu-icon-button icon='expand_more' slot="right"/>-->
    </mu-appbar>
    <div class="row no-gutters flex-nowrap align-items-stretch container-under-navbar">
      <div v-show="drawer" class="col-3 col-lg-2 sidebar">
        <mu-list class="py-0 kp-pos-sticky">
          <mu-list-item v-for="eachUserDom of userDoma" :href="'?state=main&body=Zemla:'+eachUserDom.id"
                        @click.prevent="list_item_click(eachUserDom)">
            <!--<zemla-as-link :model="eachUserDom"></zemla-as-link>-->
            {{eachUserDom.name}}
          </mu-list-item>
          <mu-list-item v-if="model.user && model.user.registrations && model.user.registrations.length"
                        href="?state=verification" @click.prevent="verification_click">
            Регистрации
          </mu-list-item>

          <mu-list-item href="https://www.youtube.com/channel/UCJRtg8s94PTFXEfZ6sEnlGw" target="_blank" @click="">
            Youtube
          </mu-list-item>

          <mu-list-item v-if="model.user" @click.prevent="close_click">
            Выход
          </mu-list-item>
        </mu-list>
      </div>
      <div :class="{'col-9':drawer, 'col-12': !drawer, 'col-lg-10':drawer}">
        <div class="padding-x-container">
          <auth v-if="!model.user && model.section!='registration'" @input="auth_input"></auth>
          <registration-as-form v-if="model.section=='registration'" :id="id+'_registration'"
                                @close="registration_close"></registration-as-form>
          <template v-if="model.user">
            <kopnik-as-verifier v-if="model.section=='verification'" :id="id+'_verification'"
                                :model="model.user"></kopnik-as-verifier>
            <div v-if="model.section=='main' && model.body">
              <!--<h1 class="title text-truncate">{{header}}</h1>-->
              <location class="breadcrumb" :model="model.body"></location>
              <component ref="bodyView" v-bind:is="bodyType" :id="id+'_body'" :model="model.body"></component>
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
        logMessage: null,
        userDoma: [],
        notifier: Notifier.getInstance(),
        grumbler: Grumbler.getInstance(),
        drawer: false,
        docked: true,
      }
    },
    props: ["id", "model"],
    watch: {
      "model.user": async function () {
        this.log.debug("user watcher")
        if (this.model.user) {
          await this.model.user.joinedLoaded()
          this.userDoma = [await this.model.user.dom.joinedLoaded()].concat(await this.model.user.dom.getParents()).reverse()
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
          /*
           if (this.model.section == Application.Section.Main) {
           let SCROLL_ITEM = this.positions.get(Application.Section.Main).get(this.model.body.constructor.name).get(this.model.body.id)
           if (SCROLL_ITEM) {
           let scrollItem = models.RemoteModel.factory(SCROLL_ITEM)
           await this.$refs.bodyView.setScrollItem(scrollItem)
           }
           }*/
        }
      }
    },
    components: {
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
        setSidebarHeight(){
          let sidebarHeight = $(window).height() - $(".sidebar").offset().top
          this.log.debug(sidebarHeight)
          $(".sidebar > .mu-list").height(sidebarHeight)
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
      async list_item_click(dom){
        Application.getInstance().goTo(dom, true)
        await Promise.resolve()
        StateManager.getInstance().pushState()
      },
      toggle () {
        this.drawer = !this.drawer

//        StateManager.getInstance().replaceState()
        StateManager.getInstance().pushState()
        Promise.resolve().then(this.setSidebarHeight.bind(this))
      },
      registration_close(){
        this.model.setSection(Application.Section.Main)
        StateManager.getInstance().pushState()
      },
      close_click(){
        this.model.logout()
      },
      toast_close(){

      },
      verification_click(){
        this.model.setSection(Application.Section.Verification)
        StateManager.getInstance().pushState()
      },
      /**
       *
       * @param credentials {email, password, captchaResponse}
       */
      auth_input: async function (credentials) {
        try {
          await this.model.authAsPromise(credentials.email, credentials.password, credentials.captchaResponse)
          await this.model.user.dom.joinedLoaded()
          this.model.setBody(this.model.user.dom)
          if (this.model.section == Application.Section.Auth) {
            this.log.warn("very strange if hire")
            StateManager.getInstance().popState(location.search.substring(1))
            this.model.setSection(Application.Section.Main)
            StateManager.getInstance().pushState()
          }
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
        this.drawer = state.drawer
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

      if (this.model.user) {
        this.userDoma = [await this.model.user.dom.joinedLoaded()].concat(await this.model.user.dom.getParents()).reverse()
        await this.model.user.reloadRegistrations()
      }

      /*
       * мобильные браузеры отваливаются после сна, даже не выплюнув событие Connection.onclose
       * поэтому тут этот момент проверяется
       */
      document.addEventListener("visibilitychange", this.document_visibilitychange = async() => {
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
          }
        }
      })

      /**
       * сервис воркер перехватывается сообщение и оно отвечает за перемотки при новых словах и копах
       */
      /*
       await navigator.serviceWorker.ready
       navigator.serviceWorker.onmessage = (event) => {
       let kopa,
       data = event.data

       switch (data.eventType) {
       case "kopaAdd":
       case "predlozhenieAdd":
       $(document.body).stop().animate({scrollTop: 0}, '1000', 'swing')
       break
       case "slovoAdd":
       $(document.body).stop().animate({scrollTop: $(document).height()}, '1000', 'swing')
       break
       }
       }
       */
    },
    mounted() {
      /**
       * решил уйти на хэши
       * такой метод более универсально при передаче ссылки с урстройства на устройства с разными форматами экрана
       */
      let deb = _.debounce(async(e) => {
        let state = await StateManager.getInstance().replaceState()
      }, 1000)

      window.addEventListener('scroll', (e) => {
        deb(e)
      })

      window.addEventListener('resize', this.setSidebarHeight.bind(this))
    },
    async beforeDestroy(){
      /**
       * выгрузить слушатель чтобы не иметь фантомных слушателей после хот-релоада application.vue
       */
      if (this.document_visibilitychange) {
        document.removeEventListener("visibilitychange", this.document_visibilitychange)
      }
    }
  }
</script>

<style scoped>
  .sidebar {
    /*border-right: solid deepskyblue 1px;*/
    /*border-color: rgba(100,100,255,0.5);*/
    /*background: rgba(100,100,255,0.1);*/
  }

  .padding-x-container {
    padding-left: .5rem;
    padding-right: .5rem;
  }

  @media (min-width: 576px) {
    .padding-x-container {
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }

  .container-under-navbar {
    margin-top: 5rem;
  }

  .sidebar > .mu-list {
    top: 5rem;
    overflow-y: auto;
    /*height: 10rem;*/
    /*border: solid black 1px;*/
  }

  .title {

  }
</style>

<style>
  /*fix muse-ui small fants*/
  html {
    font-size: 100%;
  }

  /*fix muse-ui position:sticky bug at https://github.com/museui/muse-ui/issues/453#issuecomment-298628883*/
  body, html {
    overflow: visible;
  }

  .kp-pos-sticky {
    position: sticky;
  }

  @media (max-width: 575px) {
    .mu-item {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }

  .mu-text-field-content {
    padding-top: 0;
    padding-bottom: 0;
  }

  .kp-small {
    font-size: 0.8rem;
  }

  .kp-smaller {
    font-size: 0.8em;
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

  ul {
    margin: 0;
  }

  .bg-none {
    background: none;
  }

  /*bootstrap override*/
  .card-inverse .card-blockquote .blockquote-footer, .card-inverse .card-link, .card-inverse .card-subtitle, .card-inverse .card-text {
    color: rgb(255, 255, 255);
  }

  .text-pre {
    white-space: pre-wrap;
  }
</style>
