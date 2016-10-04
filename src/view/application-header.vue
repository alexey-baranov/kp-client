<template>
    <div class="header">
        <input class="search" type="text" :value="search" placeholder="Поиск"/>
    </div>
</template>

<script>
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