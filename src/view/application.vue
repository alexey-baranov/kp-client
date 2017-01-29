<template>
  <div class="application">
    {{debug(model.state)}}
    <auth v-if="model.state=='auth'" @input="auth_input"></auth>
    <registration v-if="model.state=='register'"></registration>
    <div v-if="model.state=='main'">
      <nav class="navbar fixed-top navbar-toggleable-sm navbar-light bg-faded">
        <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse"
                data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false"
                aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand px-2" href="#">kopnik.ru</a>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
          <ul class="navbar-nav">
            <li class="nav-item dropdown <!--active-->">
              <a class="nav-link dropdown-toggle" href="http://example.com" :id="id+'navbarDropdownMenuLink'"
                 data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Земли
              </a>
              <div class="dropdown-menu" :aria-labelledby="id+'navbarDropdownMenuLink'">
                <zemla-as-link v-for="eachUserDom of userDoma" class="dropdown-item"
                               :model="eachUserDom"></zemla-as-link>
              </div>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Youtube</a>
            </li>
          </ul>
        </div>
      </nav>
      <div class="container container-under-navbar">
        {{debug(1234)}}
        <component v-bind:is="bodyType" :model="model.body"></component>
      </div>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"

  let log = require("loglevel").getLogger("application.vue")

  export default{
    data: function () {
      return {
        userDoma: []
      }
    },
    props: ["id", "model"],
    watch: {
      "model.user": async function () {
        log.debug("user watcher")
        await this.model.user.loaded()
        for (let eachDom = this.model.user.dom; eachDom; eachDom = eachDom.parent) {
          await eachDom.loaded()
          this.userDoma.unshift(eachDom)
        }
      }
    },
    components: {
      "auth": require('./auth.vue'),
      "registration": require('./registration.vue'),
      "application-navbar": require('./application-navbar.vue'),
      "application-side-panel": require('./application-side-panel.vue'),
      "zemla": require('./zemla.vue'),
      "kopa": require('./kopa.vue'),
      "kopnik": require('./kopnik.vue'),
      "zemla-as-link": require('./zemla-as-link.vue'),
    },
    computed: {
      bodyType(){
        let result = this.model.body.constructor.name.toLocaleLowerCase()

        return result
      }
    },
    methods: {
      /**
       *
       * @param cridentials {email, password}
       */
      auth_input: async function (credentials) {
        await this.model.auth(credentials.email, credentials.password)
        await this.model.user.dom.loaded()
        this.model.setBody(this.user.dom)
        this.model.state = Application.State.Main

      },
      getState(){
        return "av"
      },
      setState(){

      },
      debug(){
        log.debug.bind(log).apply(arguments)
      }
    },
    created: function () {
    },
    mounted: function () {
    },
  }

</script>

<style scoped>
  .navbar-brand {
    background-color: black;
    color: white;
  }

  .container-under-navbar{
    margin-top: 3.5rem;
  }
</style>

<style>
  * {
    font-size: 25px;
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
