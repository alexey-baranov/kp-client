<template>
    <ul class="kopa-list">
        <kopa-as-list-item v-for="eachKopa of model2.kopi" :model="eachKopa"></kopa-as-list-item>
    </ul>
</template>

<script>
    let models = require("../model");
    const log = require("loglevel").getLogger("zemla-as-kopa-list.vue")
    import StateManager from "../StateManager"

    export default{
        props: ["idd", "model"],
        components: {
            "kopa-as-list-item": require("./kopa-as-list-item.vue")
        },
        watch: {
            $route(){
                this.reloadModel();
            }
        },
        created: function () {
            this.reloadModel();
        },
        computed: {
            model2(){
                if (!this.model && this.$route.params.ZEMLA) {
                    return models.Zemla.getReference(this.$route.params.ZEMLA)
                }
                else {
                    return this.model;
                }
            }
        },
        methods: {
            reloadModel: async function () {
//                await this.model2.joinedLoaded();
                if (!this.model2.kopi) {
                    await this.model2.loadKopi();
                }
            }
        }
    }
</script>


<style scopedd>
</style>
