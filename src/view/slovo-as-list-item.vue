<template>
    <li :id= "id" class="slovo-as-list-item" >
        <div class="date"> {{ model.created }}</div>
        <div class="value"> {{ model.value }}</div>
        <div class="toolbar"> поддерживаю - не поддерживаю</div>
    </li>
</template>

<script>
    module.exports = {
        props: ["id", "model"],
    }
</script>

<style scoped>
    .slovo-as-list-item {
        border: solid black 1px;
    }

    .date {
        font-size: smaller;
    }

    .value {

    }

    .toolbar {
        background-color: #cccccc;
        font-size: smaller;
    }
</style>