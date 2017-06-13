<template>
  <div class="registration-as-form">
    <h1>Регистрация</h1>
    <form>
      <fieldset class="form-group">
        <legend>1. Учетная запись</legend>
        <div class="form-group row">
          <label for="email" class="col-sm-3 col-form-label text-truncate" title="Электронная почта">Электронная
            почта</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="email" autocomplete="off" v-model="model.email">
          </div>
        </div>
        <div class="form-group row">
          <label for="password" class="col-sm-3 col-form-label">Пароль</label>
          <div class="col-sm-9">
            <input type="password" class="form-control" id="password" autocomplete="off" v-model="model.password">
          </div>
        </div>
        <div class="form-group row">
          <label for="password2" class="col-sm-3 col-form-label text-truncate" title="Пароль еще раз">Пароль еще
            раз</label>
          <div class="col-sm-9">
            <input type="password" class="form-control" id="password2" autocomplete="off" v-model="model.password2">
          </div>
        </div>
        <div class="form-group row">
          <label for="surname" class="col-sm-3 col-form-label">Фамилия</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="surname" autocomplete="off" v-model="model.surname">
          </div>
        </div>
        <div class="form-group row">
          <label for="name" class="col-sm-3 col-form-label">Имя</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="name" autocomplete="off" v-model="model.name">
          </div>
        </div>
        <div class="form-group row">
          <label for="patronymic" class="col-sm-3 col-form-label">Отчество</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="patronymic" autocomplete="off" v-model="model.patronymic">
          </div>
        </div>
        <div class="form-group row">
          <label for="birth" class="col-sm-3 col-form-label text-truncate" title="Год рождения">Год рождения</label>
          <div class="col-sm-9">
            <select class="form-control custom-select" id="birth" v-model="model.birth">
              <option v-for="eachYear of years" :value="eachYear">{{eachYear}}</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <label for="passport" class="col-sm-3 col-form-label text-truncate" title="Последние четыре цифры паспорта">Последние
            четыре цифры паспорта</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="passport" v-model="model.passport">
            <strong class="form-text <!--text-muted-->">Защита от того что пользователь зарегистрирует несколько учетных
              записей и будет голосовать несколькими голосами.
            </strong>
            <strong class="form-text <!--text-muted--> mt-2">Мы не показываем последние четыре цифры паспорта другим
              копникам. Это информация проверяется только во время подтверждения регистрации.</strong>
          </div>
        </div>
      </fieldset>

      <fieldset class="form-group">
        <legend>2. Ваши копы по месту проживания</legend>
        <mu-auto-complete :id="this.id+'_country'" v-model="country_value" :dataSource="country_dataSource"
                          :dataSourceConfig="{text: 'name', value: 'id'}" filter="noFilter"
                          label="Страна" labelFloat fullWidth
                          @select="country_select"></mu-auto-complete>
        <div v-if="0 && address.country" class="form-text ml-4">Всего копников зарегистрировано:
          {{address.country.obshinaSize}}
        </div>
        <!--address.country:{{address.country}}-->

        <mu-auto-complete :id="this.id+'_town'" v-model="town_value" :dataSource="town_dataSource"
                          :dataSourceConfig="{text: 'name', value: 'id'}" filter="noFilter"
                          label="Город" labelFloat fullWidth
                          :disabled="!this.address.country"
                          @select="town_select"></mu-auto-complete>
        <div v-if="0 && address.town" class="form-text ml-4">Всего копников зарегистрировано в вашем городе:
          {{address.town.obshinaSize}}
        </div>

        <mu-auto-complete :id="this.id+'_street'" v-model="street_value" :dataSource="street_dataSource"
                          :dataSourceConfig="{text: 'name', value: 'id'}" filter="noFilter"
                          label="Улица" labelFloat fullWidth
                          :disabled="!this.address.town"
                          @select="street_select"></mu-auto-complete>

        <div v-if="0 && address.street" class="form-text ml-4">Всего копников зарегистрировано на вашей улице:
          {{address.street.obshinaSize}}
        </div>
        <!--address.street:{{address.street}}-->

        <mu-auto-complete :id="this.id+'_dom'" v-model="dom_value" :dataSource="dom_dataSource"
                          :dataSourceConfig="{text: 'name', value: 'id'}" filter="noFilter"
                          label="Дом" labelFloat fullWidth
                          :disabled="!this.address.street"
                          @select="dom_select"></mu-auto-complete>
        <div v-if="0 && model.dom" class="form-text ml-4">Всего копников зарегистрировано в вашем доме:
          {{model.dom.obshinaSize}}
          <!--model.dom:{{model.dom}}-->
        </div>
      </fieldset>

      <!--антибот -->
      <div class="form-group row">
        <label class="col-sm-3 col-form-label text-truncate" title="Защита от ботов">Защита от
          ботов</label>
        <div class="col-sm-9">
          <div id="g-recaptcha"></div>
          <small class="text-mute">Если вы не видите специальный элемент защиты от ботов "Я не робот", то обновите
            страницу и пройдите регистрацию снова
          </small>
        </div>
      </div>

      <div class="alert alert-danger" v-if="submited && !model.isReady() && !model.id">
        <h4 class="alert-heading">Форма заполнена не полностью</h4>
        <strong>Внимание!</strong>
        <ul class="list-unstyled2">
          <li v-if="!model.email">Не заполнено обязательное поле "Электронная почта"</li>
          <li v-if="!model.password">Не заполнено обязательное поле "Пароль"</li>
          <li v-if="model.password!= model.password2">Пароли не совпадают</li>
          <li v-if="!model.surname">Не заполнено обязательное поле "Фамилия"</li>
          <li v-if="!model.name">Не заполнено обязательное поле "Имя"</li>
          <li v-if="!model.patronymic">Не заполнено обязательное поле "Отчество"</li>
          <li v-if="!model.birth">Не заполнено обязательное поле "Год рождения"</li>
          <li v-if="!model.passport">Не заполнено обязательное поле "Последние четыре цифры паспорта"</li>
          <li v-if="!address.country">Не заполнено обязательное поле "Страна"</li>
          <li v-if="!address.town">Не заполнено обязательное поле "Город"</li>
          <li v-if="!address.street">Не заполнено обязательное поле "Улица"</li>
          <li v-if="!model.dom">Не заполнено обязательное поле "Дом"</li>
          <li v-if="!model.captchaResponse">Не пройдена защита от ботов</li>
        </ul>
        <strong>Заполните обязательные поля и нажмите "Зарегистрироваться" повторно</strong>
      </div>

      <div v-if="model.id" class="alert alert-success" role="alert">
        <h4 class="alert-heading">Вы зарегистрировались</h4>
        <!--<p>Ваша регистрация будет обработана в ближайшее время.</p>-->
        <p>
          Согласно правилам kopnik.org от вас потребуется подтвердить паспортные данные по Skype или Viber или другим
          способом передачи видео на ваш выбор.
          Или вы можете предоставить паспорт заверителю при личной встрече, если вы опасаетесь или у вас есть сомнения.
        </p>
        <p class="font-weight-bold">
          Процедура заверения нужна для того чтобы предотвратить электронную регистрацию одним человеком нескольких
          учетных записей и голосование на копах несколькими голосами.
          Просим отнестись с пониманием.
        </p>
        <p>
          Вы можете сделать это прямо сейчас или в другое удобное для вас время.
          Для этого свяжитесь с заверителем по вашему региону.
          Процедура занимает 3-5 минут. Предворительно приготовьте паспорт и убедитесь, что у вас на телефоне
          (компьютере) работает видеокамера.
        </p>
        <div class="card">
          <div class="card-block">
            <h4 class="card-title">Заверителем по вашему региону выбран копник</h4>
            <p>{{model.verifier.surname}} {{model.verifier.name}} {{model.verifier.patronymic}}</p>
            <p>email: <a :href="'mailto:'+model.verifier.email">{{model.verifier.email}}</a></p>
            <p>skype: <a :href="'skype:'+model.verifier.skype+'?call'">{{model.verifier.skype}}</a></p>
          </div>
        </div>
        <strong>Номер вашей регистрации #{{model.id}}.</strong>
        <p class="mb-0">Копия письма отправлена на указанный адрес {{model.email}}</p>
      </div>
      <p>
        <button v-if="!model.id" type="submit" id="submit" @click.prevent="submit_click"
                class="btn btn-lg btn-block btn-primary">
          Зарегистрироваться
        </button>
      </p>
    </form>
    <p>
      Вернуться назад на <a href="/?state=auth" @click.prevent="close_click">страницу входа</a>
    </p>
  </div>
</template>

<script>
  let $ = require("jquery")

  import captcha from "./mixin/captcha"
  let Cookies = require("js-cookie")
  import Rx from "rxjs/Rx"

  import config from  "../../cfg/main"
  import Connection from "../Connection"
  import logMixin from "./mixin/log"
  import models from "../model"
  import Notifier from "../Notifier"

  export default{
    name: "registration-as-form",
//    mixins: [logMixin, captcha],
    mixins: [captcha],
    data() {
      let years = []
      for (let eachYear = 1900; eachYear < new Date().getFullYear() - 29; eachYear++) {
        years.push(eachYear)
//        config.log(years)
      }
      return {
        model: new models.Registration(),
        /**
         * промежуточные элементы адреса, которые не нужны при регистрации
         */
        address: {
          country: null,
          town: null,
          street: null
        },
        /**
         * нажал ли пользователь кнопку "Зарегистрироваться"
         * Нужна для вывода сообщения о незаполненных полях
         */
        submited: false,
        testValue: null,
        years,
        random: Math.round(Math.random() * 1000000),
        country_dataSource: [],
        town_dataSource: [],
        street_dataSource: [],
        dom_dataSource: [],
        country_value: null,
        town_value: null,
        street_value: null,
        dom_value: null,
      }
    },
    props: ["id"],
    components: {},
    methods: {
      country_input(){

      },
      close_click(){
        this.$emit("close", this)
      },
      captchaCallback(response){
        this.model.captchaResponse = response
      },
      captchaExpiredCallback(){
        this.model.captchaResponse = undefined
      },
      async submit_click(){
        this.submited = true;
        /**
         * если все готово отправляю заявку
         * иначе скролю экран вниз где ошибки
         */
        if (this.model.isReady()) {
          try {
            $("#submit").attr("disabled", true)
            debugger
            this.model = await models.Registration.create(this.model)
            $("html, body").animate({scrollTop: $(document).height()}/*, "fast"*/);
          }
          catch (err) {
            $("#submit").attr("disabled", false)
            throw err
          }
        }
        else {
          $("html, body").animate({scrollTop: $(document).height()}/*, "fast"*/);
        }
      },
      async country_select(item, index){
        this.address.country = item
        this.address.town = this.address.street = this.model.dom = null
        this.town_value = this.street_value = this.dom_value = ""
      },
      async town_select(item, index){
        this.address.town = item
        this.address.street = this.model.dom = null
        this.street_value = this.dom_value = ""
      },
      async street_select(item, index){
        this.address.street = item
        this.model.dom = null
        this.dom_value = ""
      },
      async dom_select(item, index){
        this.model.dom = item
      },
    },
    beforeCreate(){
    },
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      if (!Connection.getAnonymousInstance().isOpen) {
        this.connection = Connection.getAnonymousInstance()

        await new Promise((res, rej) => {
          Connection.getAnonymousInstance().onopen = async (session, details) => {
            this.log.debug("anonymous session opened")
            Cookies.remove("cbtid")
            session.prefix('api', 'ru.kopa')
            res()
          }

          Connection.getAnonymousInstance().onclose = async (reason, details) => {
            this.log.error("anonymous session open fails", reason, details)
            if (reason == "closed" || reason == "unreachable" || reason == "unsupported")
              rej(new Error(reason + " " + details.reason + " " + details.message))
          }
          Connection.getAnonymousInstance().open()
        })
      }
//      await this.model.fill()
    },
    async mounted() {
//        страна
      Rx.Observable.fromEvent(document.querySelector(`#${this.id}_country input`), "input")
        .do(() => {
          this.country_dataSource = []
        })
        .debounceTime(300)
        .distinctUntilChanged()
        .switchMap(event => event.target.value ? Rx.Observable.fromPromise(this.model.getCountries(event.target.value)) : Rx.Observable.of([]))
        .subscribe(datasource => {
          this.country_dataSource = datasource
        })
//      город
      Rx.Observable.fromEvent(document.querySelector(`#${this.id}_town input`), "input")
        .do(() => {
          this.town_dataSource = []
        })
        .debounceTime(300)
        .distinctUntilChanged()
        .switchMap(event => event.target.value ? Rx.Observable.fromPromise(this.model.getTowns(event.target.value, this.address.country.id)) : Rx.Observable.of([]))
        .subscribe(datasource => {
          this.town_dataSource = datasource
        })
//      улица
      Rx.Observable.fromEvent(document.querySelector(`#${this.id}_street input`), "input")
        .do(() => {
          this.street_dataSource = []
        })
        .debounceTime(300)
        .distinctUntilChanged()
        .switchMap(event => event.target.value ? Rx.Observable.fromPromise(this.model.getStreets(event.target.value, this.address.town.id)) : Rx.Observable.of([]))
        .subscribe(datasource => {
          this.street_dataSource = datasource
        })
//      дом
      Rx.Observable.fromEvent(document.querySelector(`#${this.id}_dom input`), "input")
        .do(() => {
          this.dom_dataSource = []
        })
        .debounceTime(300)
        .distinctUntilChanged()
        .switchMap(event => event.target.value ? Rx.Observable.fromPromise(this.model.getHouses(event.target.value, this.address.street.id)) : Rx.Observable.of([]))
        .subscribe(datasource => {
          this.dom_dataSource = datasource
        })


//      let this2 = this

      /*
       Typeahead($(`#country`),{
       autoSelect: false,
       delay: 500,
       source(term, process) {
       this2.model.getCountries(term)
       .then(process)
       }
       })
       $(`#country`).change(function () {
       var active = global.$(this).typeahead("getActive")
       if (active && active.name.toLowerCase() == $(this).val().toLowerCase()) {
       this2.address.country = active
       $("town").attr("disabled", false)
       }
       else {
       this2.address.country = null
       }
       })
       */
      /*

       global.$('#town').typeahead({
       autoSelect: false,
       delay: 500,
       source: (term, process) => {
       this2.model.getTowns(term, this2.address.country.id)
       .then(process)
       }
       })
       .change(function () {
       var active = global.$(this).typeahead("getActive")
       if (active && active.name.toLowerCase() == $(this).val().toLowerCase()) {
       this2.address.town = active
       $("street").attr("disabled", false)
       }
       else {
       this2.address.town = null
       }
       })

       global.$('#street').typeahead({
       autoSelect: false,
       delay: 500,
       source: (term, process) => {
       this2.model.getStreets(term, this2.address.town.id)
       .then(process)
       }
       })
       .change(function () {
       var active = global.$(this).typeahead("getActive")
       if (active && active.name.toLowerCase() == $(this).val().toLowerCase()) {
       this2.address.street = active
       $("dom").attr("disabled", false)
       }
       else {
       this2.address.street = null
       }
       })

       global.$('#dom').typeahead({
       autoSelect: false,
       delay: 2000,
       source: (term, process) => {
       this2.model.getHouses(term, this2.address.street.id)
       .then(process)
       }
       })
       .change(function () {
       var active = global.$(this).typeahead("getActive")
       if (active && active.name.toLowerCase() == $(this).val().toLowerCase()) {
       this2.model.dom = models.Zemla.getReference(active.id)
       this2.model.dom.obshinaSize = active.obshinaSize
       }
       else {
       this2.model.dom = null
       }
       })
       */
    },
    beforeDestroy(){
      if (this.connection) {
        return new Promise((res, rej) => {
          Connection.getAnonymousInstance().onclose = async (session, details) => {
            this.log.debug("anonymous session closed")
            res()
          }
          Connection.getAnonymousInstance().close()
        })
      }
    }
  }

</script>

<style scoped>
</style>
