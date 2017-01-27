<template>
    <div class="header">
        <a href="/public/poligonvue/">home</a>
        <input class="search" type="text" :value="search" placeholder="Поиск"/>
    </div>
</template>

<script>
  let log = require("loglevel").getLogger("application-header.vue")

    module.exports = {
        data: function () {
            return {
                search: ""
            };
        },
    }
</script>

<style scoped>
</style>
