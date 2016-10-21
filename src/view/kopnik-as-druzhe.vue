<template>
    <div class="kopnik-as-druzhe">
        <div class="fio">
            <span style="cursor: pointer;" class="material-icons md-dark md-1em" @click="onDruzhinaToggle()">{{druzhinaDisplay?'keyboard_arrow_down':'keyboard_arrow_right'}}</span>
            <kopnik-as-link :model="model"> ({{model.voiskoSize}})</kopnik-as-link>
        </div>
        <div v-show="druzhinaDisplay" class="druzhina">
            <ul v-show="model.druzhina">
                <kopnik-as-druzhe v-for="eachDruzhe of model.druzhina" :model="eachDruzhe"></kopnik-as-druzhe>
            </ul>
        </div>
    </div>
</template>

<script>
    const models = require("../model");

    export default{
        name: "kopnik-as-druzhe",
        data: function () {
            return {
                /**
                 * значение druzhina.display= true || false
                 */
                druzhinaDisplay: false,
            };
        },
        props: ["id", "model"],
        components: {
            "kopnik-as-link": require("./kopnik-as-link.vue"),
        },
        created: function () {
            this.loadModel();
        },
        methods: {
            loadModel: async function () {
                await this.model.loaded();
            },

            /**
             * Создает новое слово
             */
            onDruzhinaToggle: async function () {
                this.druzhinaDisplay=!this.druzhinaDisplay;
                if (this.druzhinaDisplay && !this.model.druzhina) {
                    this.model.loadDruzhina();
                }
            },
        }
    }
</script>


<style scoped>
    .header {
        background-color: #cccccc;
        font-size: smaller;
    }

    .druzhina-toggler{
        cursor: pointer;
    }
</style>