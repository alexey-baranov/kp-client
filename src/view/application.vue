<template>
  <div class="application">
    <mu-toast v-if="!notifier.empty" :message="notifier.notifications[0].value" @close="toast_close"/>
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
      <auth v-if="model.state=='auth'" @input="auth_input"></auth>
      <registration-as-form v-if="model.state=='registration'"></registration-as-form>
      <kopnik-as-verifier v-if="model.state=='verification'" :model="model.user"></kopnik-as-verifier>
      <div v-if="model.state=='main'">
        <h1 class="title">{{model.body.name}}</h1>
        <location :model="model.body"></location>
        <component v-bind:is="bodyType" :model="model.body"></component>
      </div>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"
  import Notifier from "../Notifier"
  import StateManager from "../StateManager"

  export default{
    data: function () {
      return {
        userDoma: [],
        notifier: Notifier.getInstance()
      }
    },
    props: ["id", "model"],
    watch: {
      "model.user": async function () {
        this.log.debug("user watcher")
        await this.model.user.loaded()
        for (let eachDom = this.model.user.dom; eachDom; eachDom = eachDom.parent) {
          await eachDom.loaded()
          this.userDoma.unshift(eachDom)
        }
      },
      "model.body": async function () {
        if (!(this.model.body instanceof models.RemoteModel)) {
          throw new Error("Неверный тип тела")
        }
        await this.model.body.loaded()
      }
    },
    components: {
      "auth": require('./auth.vue'),
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
       * @param cridentials {email, password}
       */
      auth_input: async function (credentials) {
        try {
            debugger
          await this.model.auth(credentials.email, credentials.password)
          await this.model.user.dom.loaded()
          this.model.setBody(this.model.user.dom)
          debugger
          this.model.state = Application.State.Main
        }
        catch (err) {
          if (err.reason == 'wamp.error.authentication_failed') {
            this.notifier.pushNotification("Неверное имя пользователя или пароль")
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
    created: function () {
      this.log = require("loglevel").getLogger("application.vue")
    },
    mounted: function () {
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
