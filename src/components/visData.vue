<template>
    <div id="mynetwork"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { DataSet } from 'vis-data';
import { Network, Data, Options } from 'vis-network';

onMounted(() => {
    const nodes = new DataSet([
        { id: 1, label: 'Node 1' },
        { id: 2, label: 'Node 2' },
        { id: 3, label: 'Node 3' },
        { id: 4, label: 'Node 4' },
        { id: 5, label: 'Node 5' }
    ]);

    const edges = new DataSet<{ id: number, from: number, to: number, label?: string }>([
        { id: 1, from: 1, to: 3, label: 'Edge 1-3' },
        { id: 2, from: 1, to: 2, label: 'Edge 1-2' },
        { id: 3, from: 2, to: 4, label: 'Edge 2-4' },
        { id: 4, from: 2, to: 5, label: 'Edge 2-5' }
    ]);

    const container = document.getElementById('mynetwork') as HTMLElement;
    const data: Data = {
        nodes: nodes,
        edges: edges
    };
    const options: Options = {
        edges: {
            arrows: {
                to: { enabled: true, scaleFactor: 1 } // Add arrowheads to the edges
            },
            font: {
                align: 'horizontal', // Always display labels horizontally
                size: 14, // Font size
                face: 'arial', // Font family
                color: '#343434', // Font color
                background: 'white', // Background color of the label
                strokeWidth: 2, // Width of the stroke around the text
                strokeColor: '#ffffff' // Color of the stroke around the text
            }
        }
    };
    new Network(container, data, options);
});
</script>

<style scoped>
#mynetwork {
    width: 800px;
    height: 600px;
    border: 1px solid lightgray;
}
</style>