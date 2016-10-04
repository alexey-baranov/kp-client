<template>
    <li :id= "id" class="predlozhenie-as-list-item" >
        <div class="value">{{model.value}}</div>
        <div class="note">{{model.note}}</div>
        <div class="toolbar">
            <span class="author">{{model.author.id}} </span>
            <span class="created">{{model.created}} </span>
            <span class="created">{{model.totalZa}} </span>
            <span class="created">{{model.totalProtiv}} x</span>
        </div>
    </li>
</template>

<script>
    module.exports = {
        props: ["id", "model"],
        created: function () {
            this.model.loaded();
        }
    }
</script>

<style scoped>
    .predlozhenie-as-list-item {
        border: solid black 1px;
    }

    .created {
        font-size: smaller;
    }

    .value {

    }

    .toolbar {
        background-color: #cccccc;
        font-size: smaller;
    }
</style>