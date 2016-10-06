<template>
    <li :id="id" class="predlozhenie-as-list-item">
        <template v-if="model.id">
            <div class="value">{{model.value}}</div>
            <div class="note">{{model.note}}</div>
            <div class="toolbar">
                <span class="author">{{model.author.id}}</span>
                <span class="created">{{model.created}}</span>
                <span class="created">{{model.totalZa}}</span>
                <span class="created">{{model.totalProtiv}}</span>
            </div>
        </template>
        <template v-else>
            <textarea class="value" v-model="model.value"
                      placeholder="Ваше предложение, которое будет поставлено на голосование на копе"> </textarea>
            <textarea class="note" v-model="model.note" placeholder="Примечание"></textarea>
            <slot></slot>
        </template>
    </li>
</template>

<script>
    module.exports = {
        props: ["id", "model"],
        created: function () {
            if (this.model.id) {
                this.model.loaded();
            }
        },
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