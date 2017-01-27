<template>
    <li :id="id" class="slovo-as-list-item">
        <template v-if="model.id">
            <div class="created">{{model.created}}</div>
            <div class="value">{{model.value}}</div>
            <div class="note">{{model.note}}</div>
            <div class="toolbar">поддерживаю - не поддерживаю</div>
        </template>
        <template v-else>
            <textarea class="value" v-model="model.value"placeholder="Ваше слово"> </textarea>
            <textarea class="note" v-model="model.note" placeholder="Примечание"> </textarea>
            <slot> </slot>
        </template>
    </li>
</template>

<script>
  const log = require("loglevel").getLogger("slovo-as-list-item.vue")

    module.exports = {
        props: ["id", "model"],
        created: function () {
            if (this.model.id) {
                this.model.loaded();
            }
        }
    }
</script>

<style scoped>
    .slovo-as-list-item {
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
