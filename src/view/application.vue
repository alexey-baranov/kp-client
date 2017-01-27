<template>
  <div :id="id" class="application">
    <auth v-if="model.state=='auth'" @input="auth_input"></auth>
    <registration v-if="model.state=='register'"></registration>
    <work v-if="model.state=='main'"></work>
  </div>
</template>

<script>

  export default{
    components: {
      "auth": require('./auth.vue'),
      "registration": require('./registration.vue'),
      "work": require('./work.vue'),
    },
    methods: {
      /**
       *
       * @param cridentials {email, password}
       */
      auth_input: function (credentials) {
        this.model.auth(credentials.email, credentials.password)
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
