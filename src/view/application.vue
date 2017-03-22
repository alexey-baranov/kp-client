<template>
  <div class="application">
    <small id="log" class="" style="z-index: 100000; position: fixed; left:0; top:0;">{{logMessage}}</small>
    <grumbler :model="grumbler"></grumbler>
    <mu-toast v-if="notifier.currentNotification" :message="notifier.currentNotification.value" @close="toast_close"/>

    <mu-appbar class="fixed-top" title="kopnik.org">
      <mu-icon-button icon='menu' @click="toggle()" slot="left"/>
      <!--<mu-icon-button icon='expand_more' slot="right"/>-->
    </mu-appbar>
    <div class="row no-gutters flex-nowrap container-under-navbar">
      <div v-if="drawer" class="col-3 col-lg-2">
        <mu-list class="list-group" @itemClick="docked ? '' : toggle()">
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
          <auth v-if="!model.user && model.state!='registration'" @input="auth_input"></auth>
          <registration-as-form v-if="model.state=='registration'" :id="id+'_registration'"
                                @close="registration_close"></registration-as-form>
          <template v-if="model.user">
            <kopnik-as-verifier v-if="model.state=='verification'" :id="id+'_verification'"
                                :model="model.user"></kopnik-as-verifier>
            <div v-if="model.state=='main' && model.body">
              <h1 class="title text-truncate">{{bodyType=='kopnik'?model.body.fullName:model.body.name}}</h1>
              <location class="breadcrumb" :model="model.body"></location>
              <component v-bind:is="bodyType" :id="id+'_body'" :model="model.body"></component>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  let $ = require("jquery")(window)
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
      "model.body": async function () {
        if (this.model.body) {
          if (!(this.model.body instanceof models.RemoteModel)) {
            throw new Error("Неверный тип тела")
          }
          await this.model.body.joinedLoaded()
          /**
           * такой код работает хорошо всегда
           */
          if (this.model.state == Application.State.Main) {
//          Vue.nextTick(()=>{})
//            this.log.debug(this.model.body.toString(), this.positions.get(Application.State.Main).get(this.model.body.constructor.name).get(this.model.body.id))
            $.scrollTop(this.positions.get(Application.State.Main).get(this.model.body.constructor.name).get(this.model.body.id) || 0)
          }
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
      }
    },
    methods: {
      list_item_click(dom){
        Application.getInstance().goTo(dom)
        StateManager.getInstance().pushState()
      },
      toggle () {
        this.drawer = !this.drawer
//        StateManager.getInstance().replaceState()
        StateManager.getInstance().pushState()
      },
      registration_close(){
        this.model.state = Application.State.Auth
        StateManager.getInstance().pushState()
      },
      close_click(){
        this.model.logout()
      },
      toast_close(){

      },
      verification_click(){
        this.model.state = Application.State.Verification
        StateManager.getInstance().pushState()
      },
      /**
       *
       * @param credentials {email, password, captchaResponse}
       */
      auth_input: async function (credentials) {
        try {
          await this.model.auth(credentials.email, credentials.password, credentials.captchaResponse)
          await this.model.user.dom.joinedLoaded()
          this.model.setBody(this.model.user.dom)
          StateManager.getInstance().popState(location.search.substring(1))
          if (this.model.state == Application.State.Auth) {
            this.model.state = Application.State.Main
            StateManager.getInstance().pushState()
          }
        }
        catch (err) {
          this.grumbler.pushError(err)
        }
      },
      getState(){
        return {
          drawer: this.drawer
        }
        return {
          scrollY: window.scrollY
        }
      },
      setState(state){
        if (!state) {
          state = {}
        }
        this.drawer = state.drawer
        /**
         * такой код работает хорошо, но он не обеспечивает правильное поведение во всех случаях
         * например если из копы кнопками назад потом вперед он сработает
         * а из копы кнопкой назад, а потом мышкой заходим обратно, то скрол будет в начале экрана
         *
         */
        /*
         this.log.debug("#setState()", state.scrollY)
         $.scrollTop(state.scrollY)
         */
      },
      debug(){
        this.log.debug.bind(log).apply(arguments)
      }
    },
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      this.positions = new Map()
      this.positions.set(Application.State.Main, new Map())
      for (let each of models.RemoteModel.cache.keys()) {
        this.positions.get(Application.State.Main).set(each, new Map())
      }


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
    },
    mounted() {
      window.addEventListener('scroll', (e) => {
        if (this.model.state == Application.State.Main && this.model.body) {
          /**
           * такой код работает хорошо всегда
           */
          this.positions.get(Application.State.Main).get(this.model.body.constructor.name).set(this.model.body.id, window.scrollY)
//          this.log.debug(this.positions)

          /**
           * такой код работает хорошо, но он не обеспечивает правильное поведение во всех случаях
           * например если из копы кнопками назад потом вперед он сработает
           * а из копы кнопкой назад, а потом мышкой заходим обратно, то скрол будет в начале экрана
           *
           */
//          StateManager.getInstance().replaceState()
        }
      })
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
  .padding-x-container {
    padding-left: .5rem;
    padding-right: .5rem;
  }

  @media (min-width: 576px) {
    .padding-x-container {
      padding-left: 3rem;
      padding-right: 3rem;
    }
  }

  .container-under-navbar {
    margin-top: 4rem;
  }

  .title {

  }
</style>

<style>
  .mu-drawer {
    /*display: none;*/
    /*position: static;*/
  }

  .mu-drawer.open {
    /*display: block;*/
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
