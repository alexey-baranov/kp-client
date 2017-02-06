<template>
  <div :id="id" class="auth">
    <h1>Вход</h1>
    <form class="row">
      <div class="col-10 col-sm-7 col-md-5 col-lg-3 mx-auto my-auto">
        <div class="form-group w-100">
          <input type="text" class="form-control" required placeholder="Электронная почта" v-model="email">
        </div>
        <div class="form-group w-100">
          <input type="password" class="form-control" required placeholder="Пароль" v-model="password">
        </div>
        <div class="form-group w-100">
          <input type="submit" class="btn btn-primary btn-block mt-3" value="Войти" @click.prevent="submit_click">
        </div>
      </div>
    </form>
  </div>
</template>

<script>
  let log = require("loglevel").getLogger("auth.vue")

  export default{
    data: function () {
      return {
        email: "unittest2@domain.ru",
        password: "qwerty"
      }
    },
    props: ["id"],
    components: {},
    methods: {
      submit_click: function () {
        this.$emit("input", this.$data);
      }
    },
    created: function () {
    },
    mounted: function () {
    },
  }

</script>

<style scoped>
  .auth form {
    min-height: 70vh;
    /*width: 17rem*/
  }
</style>
