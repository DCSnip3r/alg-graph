<script setup lang="ts">
import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'  
import { VueFlow } from '@vue-flow/core'
import { Alg } from 'cubing/alg'


// these components are only shown as examples of how to use a custom node or edge
// you can find many examples of how to create these custom components in the examples page of the docs
import TwistyNode from './TwistyNode.vue'
import SpecialEdge from './SpecialEdge.vue'
import { useSpawnNode } from '../composables/useSpawnNode.ts'
import { useSpawnMirrorNodes } from '../composables/useSpawnMirrorNode.ts'
import { useSpawn3Nodes } from '../composables/useSpawn3Nodes.ts'

const sune = 'R U R\' U R U2\' R\'' //new Alg('R U R\' U R U2 R\'')
const adjustment = 'U'

const nodes = ref<Node[]>([{
  id: '1',
  type: 'twisty',
  position: { x: 0, y: 0 },
  data: { 
    label: 'Solved'
    // alg: sune, 
    },
}]) 

const edges = ref<Edge[]>([])

const {newNode: n1} = useSpawnNode(sune, nodes.value[0], "u", "d", nodes.value, edges.value)
const {newNode: n2} = useSpawnNode(sune, n1, "u", "d", nodes.value, edges.value)
const {newNode: n3} = useSpawnNode(sune, n2, "u", "d", nodes.value, edges.value)
const {newNode: n4} = useSpawnNode(sune, n3, "u", "d", nodes.value, edges.value)
const {newNode: n5} = useSpawnNode(sune, n4, "u", "d", nodes.value, edges.value)
const {newNode: n6} = useSpawnNode(sune, n5, "u", "d", nodes.value, edges.value)

// const { newNode1:n2, newNode2:n3, newNode3:n4 } = useSpawn3Nodes("U", "U\'", "U2", n1, nodes.value, edges.value)
// const { newNode: n5 } = useSpawnNode(sune, n2, "u", "d", nodes.value, edges.value)
// const { newNode: n6 } = useSpawnNode(sune, n3, "u", "d", nodes.value, edges.value)
// const { newNode: n7 } = useSpawnNode(sune, n4, "u", "d", nodes.value, edges.value)

// useSpawnNode(sune, n5, "u", "d", nodes.value, edges.value)
// useSpawnNode(sune, n6, "u", "d", nodes.value, edges.value)
// useSpawnNode(sune, n7, "u", "d", nodes.value, edges.value)

</script>

<template>
  <div style="width: 100vw; height: 100vh;">
      <VueFlow :nodes="nodes" :edges="edges">
        <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
        <template #node-twisty="twistyNodeProps">
          <TwistyNode v-bind="twistyNodeProps" />
        </template>
        <!-- bind your custom edge type to a component by using slots, slot names are always `edge-<type>` -->
        <template #edge-special="specialEdgeProps">
          <SpecialEdge v-bind="specialEdgeProps" />
        </template>
      </VueFlow>
  </div>
</template>
