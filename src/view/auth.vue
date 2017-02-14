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
          <div id="g-recaptcha"></div>
        </div>
        <div class="form-group w-100">
          <input type="submit" class="btn btn-primary btn-block mt-3" value="Войти" :disabled="!captchaResponse"
                 @click.prevent="submit_click">
        </div>
        <div>
          Или перейдите на <a href="/?state=registration" @click.prevent="registration_click">страницу регистрации</a>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
  import $ from "jquery"

  import Application from "../Application"
  import captcha from './mixin/captcha'
  import logMixin from "./mixin/log"
  import Notifier from "../Notifier"
  import StateManager from "../StateManager"

  export default{
    name:"auth",
//    mixins:[logMixin, captcha],
    mixins:[captcha],
    data() {
      return {
        email: "unittest2@domain.ru",
        password: "qwerty",
        captchaResponse: undefined,
      }
    },
    props: ["id"],
    components: {},
    methods: {
      captchaCallback(response){
        this.captchaResponse = response
      },
      captchaExpiredCallback(){
        this.captchaResponse = undefined
      },
      registration_click(event){
        Application.getInstance().state = Application.State.Registration
        StateManager.getInstance().pushState()
        event.preventDefault()
      },
      submit_click() {
        this.$emit("input", this.$data)
        global.grecaptcha.reset()
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
    },
    mounted() {
    },
    beforeDestroy(){
    }
  }

</script>

<style scoped>
  .auth form {
    min-height: 70vh;
    /*width: 17rem*/
  }
</style>
