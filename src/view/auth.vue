<template>
  <div :id="id" class="auth">
    <form>
      <div>Имя пользователя</div>
      <div>
        <input type="text" name="username" required v-model="email">
      </div>

      <div>Пароль</div>
      <div>
        <input type="password" name="password" required v-model="password">
      </div>

      <input type="submit" value="Войти" @click="submit_click">
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
</style>
