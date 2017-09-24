<template>
  <div :id="id" class="auth">

    <form class="row">
      <div class="col-10 col-sm-7 col-md-5 col-lg-4 mx-auto">
        <blockquote class="row text-muted my-4 ">
          <div class="col-12 mb-2 text-justify">{{quote.value}}</div>
          <em class="col-auto ml-auto" style="width: auto; ">{{quote.owner.name}}<br>{{quote.owner.position}}</em>
        </blockquote>

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
          <input type="submit" class="btn btn-primary btn-block mt-3" value="Войти"
                 :disabled="false && !((captchaResponse || email==unittest2Username) && email && password )"
                 @click.prevent="submit_click">
        </div>
        <div>
          Или перейдите на <a href="/?state=registration" @click.prevent="registration_click">страницу регистрации</a>
        </div>
        <div class="text-muted my-4 text-justify">
          <strong class="lead">Копное право</strong> - наша исконная технология самоорганизации.
          Мы возраждаем копное право в России, Беларуси и на Украине.
          <div class="text-center lead mt-1">Пока мы едины, мы непобедимы!</div>
        </div>
      </div>

    </form>
      <div class="col-4 paper" style="background: url('/static/logo/logo512x512.png') no-repeat center; background-size: contain;"></div>
    </div>
  </div>
</template>

<script>
  import $ from "jquery"

  import Application from "../Application"
  import captcha from './mixin/captcha'
  import config from "../../cfg/main"
  import logMixin from "./mixin/log"
  import Notifier from "../Notifier"
  import StateManager from "../StateManager"

  export default{
    name: "auth",
    mixins:[logMixin, captcha],
//    mixins: [captcha],
    data() {
      return {
        quote: undefined,
        email: null, //"unittest2@domain.ru",
        password: null, //"qwerty",
        captchaResponse: undefined,
        unittest2Username: config.unittest2.username,
      }
    },
    props: ["id"],
    components: {},
    methods: {
      setQuote(){
        let index = _.random(Application.getInstance().quotes.length - 1)
        this.log.debug("quote index", index)
        this.quote = Application.getInstance().quotes[index]
      },
      captchaCallback(response){
        this.captchaResponse = response
      },
      captchaExpiredCallback(){
        this.captchaResponse = undefined
      },
      registration_click(event){
        Application.getInstance().section = Application.Section.Registration
        StateManager.getInstance().pushState()
        event.preventDefault()
      },
      submit_click() {
        this.$emit("input", this.$data)
        this.captchaResponse = undefined
        global.grecaptcha.reset()
      }
    },
    created() {
//      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
        this.setQuote()
    },
    mounted() {
    },
    beforeDestroy(){
    }
  }

</script>

<style scoped>
  .auth form {
    /*min-height: 70vh;*/
    /*width: 17rem*/
  }
</style>
