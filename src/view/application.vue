<template>
  <div class="application">
    <grumbler :model="grumbler"></grumbler>
    <mu-toast v-if="notifier.currentNotification" :message="notifier.currentNotification.value" @close="toast_close"/>
    <nav class="navbar fixed-top navbar-toggleable navbar-light bg-faded"><!---->
      <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse"
              data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false"
              aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand px-2" href="#">kopnik.org</a>
      <!--<span class="navbar-brand px-2">kopnik.org</span>-->
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li v-if="model.user" class="nav-item dropdown <!--active-->">
            <a class="nav-link dropdown-toggle" href="http://kopnik.org" :id="id+'navbarDropdownMenuLink'"
               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Земли
            </a>
            <div class="dropdown-menu" :aria-labelledby="id+'navbarDropdownMenuLink'">
              <zemla-as-link v-for="eachUserDom of userDoma" class="dropdown-item"
                             :model="eachUserDom"></zemla-as-link>
            </div>
          </li>

          <a class="nav-link" href="#">asdfsd</a>

          <li v-if="model.user && model.user.registrations && model.user.registrations.length" class="nav-item">
            <a class="nav-link" href="/?state=verification" @click.prevent="verification_click">Регистрации</a>
          </li>

          <li class="nav-item">
            <a class="nav-link" target="_blank"
               href="https://www.youtube.com/channel/UCJRtg8s94PTFXEfZ6sEnlGw">Youtube</a>
          </li>

          <li v-if="model.user" class="nav-item">
            <a class="nav-link" href="#" @click.prevent="close_click">Выход</a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="container container-under-navbar">
      <auth v-if="!model.user && model.state!='registration'" @input="auth_input"></auth>
      <registration-as-form v-if="model.state=='registration'" :id="id+'_registration'"></registration-as-form>
      <template v-if="model.user">
        <kopnik-as-verifier v-if="model.state=='verification'" :id="id+'_verification'"
                            :model="model.user"></kopnik-as-verifier>
        <div v-if="model.state=='main' && model.body">
          <h1 class="title text-truncate">{{bodyType=='kopnik'?model.body.fullName:model.body.name}}</h1>
          <location :model="model.body"></location>
          <component v-bind:is="bodyType" :id="id+'_body'" :model="model.body"></component>
        </div>
      </template>
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

  export default{
    name: "application",
//    mixins:[logMixin], выдает ошибку
    data(){
      return {
        userDoma: [],
        notifier: Notifier.getInstance(),
        grumbler: Grumbler.getInstance(),
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
          await
            this.model.auth(credentials.email, credentials.password, credentials.captchaResponse)
          await
            this.model.user.dom.joinedLoaded()
          this.model.setBody(this.model.user.dom)
//          this.model.state = Application.State.Main
          StateManager.getInstance().popState(location.search.substring(1))
        }
        catch (err) {
          if (err.reason == 'wamp.error.authentication_failed') {
            if (err.message.indexOf("org.kopnik.invalid_captcha_status_code") != -1) {
              Grumbler.getInstance().pushError("Вы не прошли Антибот-проверку - проверка временно невозможна")
            }
            else if (err.message.indexOf("org.kopnik.invalid_captcha") != -1) {
              Grumbler.getInstance().pushError("Вы не прошли Антибот-проверку")
            }
            else if (err.message.indexOf("incorrect_username_or_password") != -1) {
              this.grumbler.pushError("Неверное имя пользователя или пароль")
            }
            else {
              this.grumbler.pushError(err)
            }
          }
          else if (err.onclose_reason == 'unreachable') {
            this.grumbler.pushError("Cервер сообщений недоступен. Попробуйте зайти позже.")
          }
          else {
            this.grumbler.pushError(err)
          }
        }
      },
      getState(){
        return "av"
        return {
          scrollY: window.scrollY
        }
      },
      setState(state){
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
    }
  }
</script>

<style scoped>
  .navbar-brand {
    /*background-color: black;*/
    /*color: white;*/
  }

  .container-under-navbar {
    margin-top: 3.5rem;
  }

  .title {

  }
</style>

<style>
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

  .text-pre{
    white-space: pre-wrap;
  }
</style>
