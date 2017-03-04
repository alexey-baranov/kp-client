<template>
  <div class="registration">
    <div class="form-group row">
      <label for="email" class="col-sm-3 col-form-label text-truncate" title="Электронная почта">Электронная
        почта</label>
      <div class="col-sm-9">
        <input type="text" class="form-control" id="email" v-model="model.email">
      </div>
    </div>

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
      <label for="passport" class="col-sm-3 col-form-label text-truncate" title="Последние четыре цифры поспорта">Последние
        четыре цифры поспорта</label>
      <div class="col-sm-9">
        <input type="text" class="form-control" id="passport" v-model="model.passport">
        <!--{{model.getPlain()}}-->
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-3 col-form-label">Полный адрес</label>
      <div class="col-sm-9">
        <location target="_blank" :model="model.dom" full="true"></location>
      </div>
    </div>
  </div>
</template>

<script>
  import logMixin from "./mixin/log"
  import models from "../model"

  export default{
//    mixins:[logMixin],
    name:"registration",
    data() {
      return {
        modelDoma: []
      }
    },
    props: ["id", "model"],
    components: {
      "zemla-as-link": require("./zemla-as-link.vue"),
      "location": require("./location.vue")
    },
    methods: {
    },
    beforeCreate(){
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")

    },
    async mounted() {
      await this.model.joinedLoaded()
    },
  }

</script>

<style scoped>
</style>
