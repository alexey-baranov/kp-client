<template>
  <div>
    <auth v-if="model.state=='auth'" @input="auth_input"></auth>
    <registration v-if="model.state=='register'"></registration>
    <div v-if="model.state=='main'">
      <application-header></application-header>
      <application-side-panel :application="model"></application-side-panel>

      <component v-bind:is="bodyType" :model="model.body"></component>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"

  let log = require("loglevel").getLogger("application.vue")

  export default{
    components: {
      "auth": require('./auth.vue'),
      "registration": require('./registration.vue'),
      "application-header": require('./application-header.vue'),
      "application-side-panel": require('./application-side-panel.vue'),
      "zemla": require('./zemla.vue'),
      "kopa": require('./kopa.vue'),
      "kopnik": require('./kopnik.vue'),
    },
    computed: {
      bodyType(){
        let result = this.model.body.constructor.name.toLocaleLowerCase()
        log.debug(123)
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
      }
    },
    created: function () {
    },
    mounted: function () {
    },
  }

</script>

<style scoped>
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
