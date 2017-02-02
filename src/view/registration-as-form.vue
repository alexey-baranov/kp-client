<template>
  <div class="registration-as-form">
    <form>
      <fieldset class="form-group">
        <legend>1. Учетная запись</legend>
        <div class="form-group row">
          <label for="email" class="col-sm-3 col-form-label text-truncate" title="Электронная почта">Электронная
            почта</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="email" v-model="model.email">
          </div>
        </div>
        <div class="form-group row">
          <label for="password" class="col-sm-3 col-form-label">Пароль</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="password" v-model="model.password">
          </div>
        </div>
        <div class="form-group row">
          <label for="password2" class="col-sm-3 col-form-label text-truncate" title="Пароль еще раз">Пароль еще
            раз</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="password2" v-model="model.password2">
          </div>
        </div>
      </fieldset>

      <fieldset class="form-group">
        <legend>2. Паспортные данные</legend>
        <div class="form-group row">
          <label for="surname" class="col-sm-3 col-form-label">Фамилия</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="surname" v-model="model.surname">
          </div>
        </div>
        <div class="form-group row">
          <label for="name" class="col-sm-3 col-form-label">Имя</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="name" v-model="model.name">
          </div>
        </div>
        <div class="form-group row">
          <label for="patronymic" class="col-sm-3 col-form-label">Отчество</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="patronymic" v-model="model.patronymic">
          </div>
        </div>
        <div class="form-group row">
          <label for="birth" class="col-sm-3 col-form-label text-truncate" title="Год рождения">Год рождения</label>
          <div class="col-sm-9">
            <select class="form-control custom-select" id="birth" v-model="model.birth">
              <option v-for="n in 100" :value="n+1900">{{n+1900}}</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <label for="passport" class="col-sm-3 col-form-label text-truncate" title="Последние четыре цифры поспорта">Последние четыре цифры поспорта</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="passport" v-model="model.passport">
          </div>
        </div>
      </fieldset>

      <fieldset class="form-group">
        <legend>3. Адрес</legend>
        <div class="form-group row">
          <label for="country" class="col-sm-3 col-form-label">Страна</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="country" autocomplete="off">
          </div>
        </div>
        address.country:{{address.country}}

        <div class="form-group row">
          <label for="town" class="col-sm-3 col-form-label">Город</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="town" autocomplete="off">
          </div>
        </div>
        address.town:{{address.town}}

        <div class="form-group row">
          <label for="street" class="col-sm-3 col-form-label">Улица</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="street" autocomplete="off">
          </div>
        </div>
        address.street:{{address.street}}

        <div class="form-group row">
          <label for="dom" class="col-sm-3 col-form-label">Дом</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="dom" autocomplete="off">
          </div>
        </div>
        model.dom:{{model.dom}}
      </fieldset>

      <!--антибот -->
      <div class="form-group row">
        <label class="col-sm-3 col-form-label text-truncate" title="Защита от ботов">Защита от
          ботов</label>
        <div class="col-sm-9">
          <div id="g-recaptcha"></div>
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
        <p>Ваша регистрация будет обработана в ближайшее время.</p>
        <p>Согласно правилам сервиса от вас потребуют подтвердить паспортные данные по Skype или Viber или другим способом передачи видео на ваш выбор.</p>
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
  </div>
</template>

<script>
  const log = require("loglevel").getLogger("registration-as-form.vue")
  import Registration from "../model/Registration"
  import models from "../model"
  let $ = require("jquery")

  export default{
    data: function () {
      return {
        model: new Registration(),
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
      }
    },
    props: ["id"],
    components: {},
    methods: {
      async submit_click(){
        this.submited = true;
        this.model.captchaResponse = grecaptcha.getResponse()
        /**
         * если все готово отправляю заявку
         * иначе скролю экран вниз где ошибки
         */
        if (this.model.isReady()) {
            try {
              $("#submit").attr("disabled", true)
              debugger
              this.model = await Registration.create(this.model)
              $("html, body").animate({scrollTop: $(document).height()}/*, "fast"*/);
            }
            catch(err) {
              $("#submit").attr("disabled", false)
              throw err
            }
        }
        else {
          $("html, body").animate({scrollTop: $(document).height()}/*, "fast"*/);
        }
      },
    },
    beforeCreate(){
    },
    created: function () {

    },
    async mounted() {
      let this2 = this

      $("country").attr("disabled", false)
      global.$('#country').typeahead({
        autoSelect: false,
        delay: 500,
        source: async(term, process) => {
          let items = await this2.model.getCountries(term)
          process(items)
        }
      })
        .change(function () {
          var active = global.$(this).typeahead("getActive")
          if (active && active.name.toLowerCase() == $(this).val().toLowerCase()) {
            this2.address.country = active
            $("town").attr("disabled", false)
          }
          else {
            this2.address.country = null
          }
        })

      global.$('#town').typeahead({
        autoSelect: false,
        delay: 500,
        source: async(term, process) => {
          let items = await this2.model.getTowns(term, this2.address.country.id)
          process(items)
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
        source: async(term, process) => {
          let items = await this2.model.getStreets(term, this2.address.town.id)
          process(items)
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
        source: async(term, process) => {
          let items = await this2.model.getHouses(term, this2.address.street.id)
          process(items)
        }
      })
        .change(function () {
          var active = global.$(this).typeahead("getActive")
          if (active && active.name.toLowerCase() == $(this).val().toLowerCase()) {
            this2.model.dom = models.Zemla.getReference(active.id)
          }
          else {
            this2.model.dom = null
          }
        })

      grecaptcha.render(
        "g-recaptcha",
        {
           "sitekey": "6Le-9BMUAAAAAIx-D7vLPKysleUXNU6tzOlcX8Kr", "theme": "light"
        }
      )

      setInterval(() => {
        try {
          this.model.captchaResponse = grecaptcha.getResponse()
        }
        catch (err) {
          this.model.captchaResponse = undefined
        }
      }, 1000)
    },
  }

</script>

<style scoped>
</style>
