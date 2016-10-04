<template>
    <node-as-tree :model="model"></node-as-tree>
</template>

<script>
    import NodeAsTree from './dom-as-side-panel.vue';

    export default {
        data() {
            return { model: { name: 'child', parent: { name: 'parent' } } };
        },
        components: {
            NodeAsTree: NodeAsTree,
        },
    };
</script>