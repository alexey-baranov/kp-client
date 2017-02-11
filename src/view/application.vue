<template>
  <div class="application">
    <grumbler :model="grumbler"></grumbler>
    <mu-toast v-if="notifier.currentNotification" :message="notifier.currentNotification.value" @close="toast_close"/>
    <nav class="navbar fixed-top navbar-toggleable-sm navbar-light bg-faded">
      <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse"
              data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false"
              aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand px-2" href="#">kopnik.ru</a>
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

          <li v-if="model.user && model.user.registrations && model.user.registrations.length" class="nav-item">
            <a class="nav-link" href="/?state=verification" @click.prevent="verification_click">Регистрации</a>
          </li>

          <li class="nav-item">
            <a class="nav-link" href="#">Youtube</a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="container container-under-navbar">
      <auth v-if="!model.user && model.state!='registration'" @input="auth_input"></auth>
      <registration-as-form v-if="model.state=='registration'"></registration-as-form>
      <template v-else>
        <kopnik-as-verifier v-if="model.state=='verification'" :model="model.user"></kopnik-as-verifier>
        <div v-if="model.state=='main'">
          <h1 class="title">{{bodyType=='kopnik'?model.body.fullName:model.body.name}}</h1>
          <location :model="model.body"></location>
          <component v-bind:is="bodyType" :model="model.body"></component>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
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
        await this.model.user.joinedLoaded()
        for (let eachDom = this.model.user.dom; eachDom; eachDom = eachDom.parent) {
          await eachDom.joinedLoaded()
          this.userDoma.unshift(eachDom)
        }
      },
      "model.body": async function () {
        if (!(this.model.body instanceof models.RemoteModel)) {
          throw new Error("Неверный тип тела")
        }
        await this.model.body.joinedLoaded()
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
      toast_close(){

      },
      verification_click(){
        this.model.state = Application.State.Verification
        StateManager.getInstance().pushState()
      },
      /**
       *
       * @param credentials {email, password}
       */
      auth_input: async function (credentials) {
        try {
          await this.model.auth(credentials.email, credentials.password)
          await this.model.user.dom.joinedLoaded()
          this.model.setBody(this.model.user.dom)
//          this.model.state = Application.State.Main
          StateManager.getInstance().popState(location.search.substring(1))
        }
        catch (err) {
          if (err.reason == 'wamp.error.authentication_failed') {
            this.grumbler.pushError("Неверное имя пользователя или пароль")
          }
          else if (err.onclose_reason == 'unreachable') {
            this.grumbler.pushError("Сервер сообщений недоступен")
          }

          else {
            this.grumbler.pushError(err)
          }
        }
      },
      getState(){
        return "av"
      },
      setState(){

      },
      debug(){
        this.log.debug.bind(log).apply(arguments)
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
    },
    mounted() {
    },
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
</style>
