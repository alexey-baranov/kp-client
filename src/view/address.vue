<template>
    <div class="address">
        <ul>
            <li v-for="eachElement of elements" class="element"> > {{eachElement.name}}</li>
        </ul>
    </div>
</template>

<script>
    module.exports = {
        data: function () {
            return {
                elements: []
            };
        },
        props: ["id", "dom"],
        created: function () {
            let this2= this;
            async function fillElements(element) {
                this2.elements.unshift(element);
                await element.loaded();
                if (element.parent) {
                    fillElements(element.parent);
                }
            }

            fillElements(this.dom);
        }
    }
</script>

<style scoped>
    .element{
        display: inline;
    }
</style>