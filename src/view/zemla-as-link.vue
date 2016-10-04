<template>
    <router-link :to="{ name: 'zemla', params: { ZEMLA: model.id }}" class="zemla-as-link">{{model.name}}</router-link>
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