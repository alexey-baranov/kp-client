<template>
    <router-link :to="{ name: 'kopnik', params: { KOPNIK: model.id }}" class="kopnik-as-link">{{model.surname}} {{model.name}} {{model.patronymic}}<slot></slot></router-link>
</template>

<script>
  const log = require("loglevel").getLogger("kopnik-as-link.vue")

    export default  {
        props: ["id", "model"],
        created: function () {
            this.model.loaded();
        }
    }
</script>

<style scoped>
</style>
