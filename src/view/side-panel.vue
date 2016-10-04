<template>
    <div class="kopnik-doma">
        <zemla-as-link v-for="eachKopnikDom of kopnikDoma" :model="eachKopnikDom"></zemla-as-link>
    </div>
</template>

<script>
    module.exports = {
        data: function () {
            return {
                kopnikDoma: []
            };
        },
        props: ["id", "kopnik"],
        components:{
            "zemla-as-link": require("./zemla-as-link.vue")
        },
        created: async function () {
            let this2 = this;

            async function fillKopnikDoma(kopnikDom) {
                this2.kopnikDoma.unshift(kopnikDom);
                await kopnikDom.loaded();
                if (kopnikDom.parent) {
                    fillKopnikDoma(kopnikDom.parent);
                }
            }
            await this.kopnik.loaded();
            fillKopnikDoma(this.kopnik.dom);
        }
    }
</script>

<style scoped>
    .kopnik-doma .zemla-as-link{
        display: block;
    }
</style>