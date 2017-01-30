<template>
  <div class="registration container">
    <form>
      <fieldset class="form-group">
        <legend>1. Учетная запись</legend>
        <div class="form-group row">
          <label for="email" class="col-sm-3 col-form-label text-truncate" title="Электронная почта">Электронная
            почта</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="email" v-model="model.kopnik.email">
          </div>
        </div>
        <div class="form-group row">
          <label for="password" class="col-sm-3 col-form-label">Пароль</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="password" v-model="model.kopnik.password">
          </div>
        </div>
        <div class="form-group row">
          <label for="password2" class="col-sm-3 col-form-label text-truncate" title="Пароль еще раз">Пароль еще
            раз</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="password2" v-model="model.kopnik.password2">
          </div>
        </div>
      </fieldset>

      <fieldset class="form-group">
        <legend>2. Личные данные</legend>
        <div class="form-group row">
          <label for="surname" class="col-sm-3 col-form-label">Фамилия</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="surname" v-model="model.kopnik.surname">
          </div>
        </div>
        <div class="form-group row">
          <label for="name" class="col-sm-3 col-form-label">Имя</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="name" v-model="model.kopnik.name">
          </div>
        </div>
        <div class="form-group row">
          <label for="patronymic" class="col-sm-3 col-form-label">Очество</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="patronymic" v-model="model.kopnik.patronymic">
          </div>
        </div>
        <div class="form-group row">
          <label for="birth" class="col-sm-3 col-form-label text-truncate" title="Год рождения">Год рождения</label>
          <div class="col-sm-9">
            <select class="form-control custom-select" id="birth" v-model="model.kopnik.birth">
              <option v-for="n in 100" :value="n+1900">{{n+1900}}</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <label for="appartment" class="col-sm-3 col-form-label">Квартира</label>
          <div class="col-sm-9">
            <input type="number" class="form-control" id="appartment" min="1" v-model="model.kopnik.address.appartment">
          </div>
        </div>
      </fieldset>

      <fieldset class="form-group">
        <legend>3. Адрес</legend>
        <div class="form-group row">
          <label for="country" class="col-sm-3 col-form-label">Страна</label>
          <div class="col-sm-9">
            <input type="text" class="form-control typeahead" id="country" autocomplete="off" v-model="model.kopnik.address.country">
          </div>
        </div>
      </fieldset>

      <fieldset class="form-group">
        <legend>4. Дополнительная информация</legend>
        <div class="form-group row">
          <label for="fio" class="col-sm-3 col-form-label text-truncate" title="Фамилия Имя Очество">Фамилия Имя
            Очество</label>
          <div class="col-sm-9">
            <input type="text" id="fio" class="form-control form-control-danger" placeholder="Фамилия Имя Очество"
                   v-model="model.fio">
            <!--<div class="form-control-feedback">Сука Ебаный Врот!!!</div>-->
          </div>
        </div>
        <div class="form-group row">
          <label for="phoneNumber" class="col-sm-3 col-form-label text-truncate" title="Номер телефона">Номер
            телефона</label>
          <div class="col-sm-9">
            <input type="text" id="phoneNumber" class="form-control"
                   placeholder="Номер телефона для связи" v-model="model.phoneNumber">
          </div>
        </div>
        <div class="form-group row">
          <label for="note" class="col-sm-3 col-form-label text-truncate" title="Дополнительная информация">Дополнительная
            информация</label>
          <div class="col-sm-9">
            <textarea id="note" class="form-control" style="height: 6em"
                      placeholder="Удобное время подключения и любая другая дополнительная информация"
                      v-model="model.note"></textarea>
          </div>
        </div>
      </fieldset>

      <!--антибот -->
      <div class="form-group row">
        <label for="captcha" class="col-sm-3 col-form-label text-truncate" title="Защита от ботов">Защита от
          ботов</label>
        <div class="col-sm-9">
          <div class="g-recaptcha" data-sitekey="6LfE5RIUAAAAAETHS6VcgQ4CEjdEhDYGsS4H0mVi"></div>
        </div>
      </div>

      <div class="alert alert-danger" v-if="submited && !model.isAccountReady() && !model.id">
        <h4 class="alert-heading">Форма заполнена не полностью</h4>
        <strong>Внимание!</strong>
        <ul class="list-unstyled2">
          <li v-if="!model.address.town">Не заполнено обязательное поле "Населенный пункт"</li>
          <li v-if="!model.address.street">Не заполнено обязательное поле "Улица"</li>
          <li v-if="!model.address.house">Не заполнено обязательное поле "Дом"</li>
          <li v-if="!model.captchaResponse">Не пройдена защита от ботов</li>
        </ul>
        <strong>Заполните обязательные поля и нажмите "Зарегистрироваться" повторно</strong>
      </div>

      <div v-if="model.id" class="alert alert-success" role="alert">
        <h4 class="alert-heading">Вы зарегистрированлись</h4>
        <p>Ваша заявка на будет обработана в ближайшее время.</p>
        <strong class="mb-0">Номер вашей заявки {{model.id}}.</strong>
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
  const log = require("loglevel").getLogger("registration.vue")
  import Registration from "../Registration"

  export default{
    data: function () {
      return {
        model: new Registration(),
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
      submit_click(){
        this.submited = true;
        this.model.captchaResponse = grecaptcha.getResponse()
        /**
         * если все готово отправляю заявку
         * иначе скролю экран вниз где ошибки
         */
        if (this.model.isRequestReady()) {
          $("#submit").attr("disabled", true)
          this.model.sendRequest()
            .then(REGISTRATION => {
              $("html, body").animate({scrollTop: $(document).height()}/*, "fast"*/);
            })
            .catch(err => {
              $("#submit").attr("disabled", false)
              throw err
            })
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
    mounted: async function () {
      await this.model.auth()
      global.$("country").attr("disabled", false)
      global.$('#country').typeahead({
        source: (process)=>{

        },
        autoSelect: false,
        delay: 2000,
      })
        .change(function () {
          var current = $input.typeahead("getActive");
          if (current) {
            // Some item from your model is active!
            if (current.name == $input.val()) {
              // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
            } else {
              // This means it is only a partial match, you can either add a new item
              // or take the active if you don't want new items
            }
          } else {
            // Nothing is active so it is a new value (or maybe empty value)
          }
        })

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
