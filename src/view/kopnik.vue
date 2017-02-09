<template>
    <div class="kopnik">
        <div class="fio">
            ФИО: {{model2.surname}} {{model2.name}} {{model2.patronymic}}
            <template v-if="currentKopnik!= model2">
                <button @click="setStarshina_click">
                    {{currentKopnik.starshina != model2?"Выбрать копника своим старшиной":"Выйти из дружины копника"}}
                </button>
            </template>
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
            <div style="cursor:pointer" @click="onDruzhinaToggle()">
                <span class="material-icons md-dark md-1em">{{druzhinaDisplay?'keyboard_arrow_down':'keyboard_arrow_right'}}</span> Дружина ({{model2.voiskoSize}}):
            </div>
            <ul v-show="druzhinaDisplay">
                <kopnik-as-druzhe v-for="eachDruzhe of model2.druzhina" :model="eachDruzhe"></kopnik-as-druzhe>
            </ul>
        </div>
    </div>
</template>

<script>
  import Application from '../Application'
    const models = require("../model");
const log = require("loglevel").getLogger("kopnik.vue")
  import logMixin from "./mixin/log"

    export default{
    mixins:[logMixin],
      name:"kopnik",
        data: function () {
            return {
                /**
                 * значение druzhina.display= true || false
                 */
                druzhinaDisplay: false,
                currentKopnik: Application.getInstance().user,
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
            },
        },
        methods: {
            loadModel: async function () {
                await this.model2.joinedLoaded();
            },

            onDruzhinaToggle: async function () {
                this.druzhinaDisplay=!this.druzhinaDisplay;
                if (this.druzhinaDisplay && !this.model2.druzhina) {
                    this.model2.loadDruzhina();
                }
            },

            setStarshina_click: async function(){
                if (models.Kopnik.current.starshina== this.model2){
                    await models.Kopnik.current.setStarshina(null);
                }
                else{
                    await models.Kopnik.current.setStarshina(this.model2);
                }
            }
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
