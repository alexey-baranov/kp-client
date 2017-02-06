<template>
  <div class="kopnik-as-verifier">
    <h1>Регистрации</h1>
    <ul class="list-group">
      <li v-for="eachRegistration of model.registrations" class="list-group-item"
          :class="{'list-group-item-danger':eachRegistration.state < 0, 'list-group-item-success': eachRegistration.state > 0}">
        <registration :model="eachRegistration"></registration>
        <div v-if="eachRegistration.state==0" class="d-flex justify-content-between">
          <button class="btn btn-md btn-success" @click="verifyRegistration(eachRegistration,+1)">Заверить</button>
          <button class="btn btn-md btn-danger" @click="verifyRegistration(eachRegistration,-1)">Отклонить</button>
        </div>
      </li>
    </ul>
    <div v-if="!model.registrations || !model.registrations.length" class="alert alert-info">
      Все регистрации заверены
    </div>
  </div>
</template>

<script>
  import Application from '../Application'
  const models = require("../model");
  const log = require("loglevel").getLogger("kopnik.vue")

  export default{
    data: function () {
      return {};
    },
    props: ["id", "model"],
    components: {
      "registration": require("./registration.vue")
    },
    watch: {},
    created: function () {
    },
    computed: {},
    methods: {
      async verifyRegistration(subject, state){
        await this.model.verifyRegistration(subject, state)
      },
    },
    async mounted(){
      if (!this.model.registrations) {
        await this.model.reloadRegistrations()
      }
    }
  }

</script>


<style scoped>
  .header {
    background-color: #cccccc;
    font-size: smaller;
  }

  .druzhina-toggler {
    cursor: pointer;
  }

</style>
