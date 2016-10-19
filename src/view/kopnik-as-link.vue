<template>
    <router-link :to="{ name: 'kopnik', params: { KOPNIK: model.id }}" class="kopnik-as-link">{{model.surname}} {{model.name}} {{model.patronymic}}<slot></slot></router-link>
</template>

<script>
    export default  {
        props: ["id", "model"],
        created: function () {
            this.model.loaded();
        }
    }
</script>

<style scoped>
</style>