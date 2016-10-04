<template>
    <div :id="id" class="zemla">
        <div class="header">
            <span class="name">{{model.name}}</span>
        </div>
        <div class="bottom">
        </div>
        <ul class="kopi">
            <kopa-as-list-item v-for="eachKopa of model.kopi" :model="eachKopa" :id="id"></kopa-as-list-item>
        </ul>
    </div>
</template>

<script>
    let models= require("../model");
    export default{
        props: ["id", "model"],
        components: {
            "kopa-as-list-item": require("./kopa-as-list-item.vue")
        },
        beforeCreate: function(){
            console.log("beforeCreate...");
//            debugger;
            console.log("this.$options.propsData.model", this.$options.propsData.model);
            if (!this.model && this.$route.params.ZEMLA){
                console.log("this.$route.params.ZEMLA=", this.$route.params.ZEMLA);
                this.$options.propsData.model= models.Zemla.getReference(this.$route.params.ZEMLA);
            }
        },
        created: async function () {
//            debugger;
            await this.model.loaded();
            if (!this.model.kopi){
                await this.model.reloadKopi();
            }
        }
    }
</script>


<style scoped>
    .header {
        background-color: #cccccc;
        font-size: smaller;
    }
</style>