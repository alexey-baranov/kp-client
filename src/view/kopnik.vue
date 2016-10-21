<template>
    <div class="kopnik">
        <div class="fio">
            ФИО: {{model2.surname}} {{model2.name}} {{model2.patronymic}}
        </div>
        <div v-if="model2.dom" class="dom">
            Дом:
            <zemla-as-link :model="model2.dom"></zemla-as-link>
        </div>
        <div v-if="model2.starshina" class="starshina">
            Старшина:
            <kopnik-as-link :model="model2.starshina"></kopnik-as-link>
        </div>
        <div class="druzhina">
            <span class="druzhina-toggler" @click="onDruzhinaToggle()">+</span> Дружина ({{model2.voiskoSize}}):
            <ul v-show="druzhinaDisplay">
                <kopnik-as-druzhe v-for="eachDruzhe of model2.druzhina" :model="eachDruzhe"></kopnik-as-druzhe>
            </ul>
        </div>
    </div>
</template>

<script>
    const models = require("../model");

    export default{
        data: function () {
            return {
                /**
                 * значение druzhina.display= true || false
                 */
                druzhinaDisplay: false,
            };
        },
        props: ["id", "model", "short"],
        components: {
            "zemla-as-link": require("./zemla-as-link.vue"),
            "kopnik-as-link": require("./kopnik-as-link.vue"),
            "kopnik-as-druzhe": require("./kopnik-as-druzhe.vue"),
        },
        watch: {
            /**
             * Переход с одного копника на другого
             */
            $route(){
//                this.druzhinaDisplay = false;
                this.loadModel();
            }
        },
        created: function () {
            this.loadModel();
        },
        computed: {
            model2(){
                if (!this.model && this.$route.params.KOPNIK) {
                    return models.Kopnik.getReference(this.$route.params.KOPNIK);
                }
                else {
                    return this.model;
                }
            }
        },
        methods: {
            loadModel: async function () {
                await this.model2.loaded();
            },

            /**
             * Создает новое слово
             */
            onDruzhinaToggle: async function () {
                this.druzhinaDisplay=!this.druzhinaDisplay;
                if (this.druzhinaDisplay && !this.model2.druzhina) {
                    this.model2.loadDruzhina();
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