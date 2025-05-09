import { ref } from 'vue';
import { useSavedGraphsStore } from '../stores/savedGraphsStore';
import { useGraphPersistence } from './useGraphPersistence';
import type { SavedGraphState } from '../types/SavedGraphTypes';

export function useGraphManagement(emit: any) {
  const savedGraphsStore = useSavedGraphsStore();
  // Only pass empty object if not using node/edge state here
  const {
    saveGraphToStore,
    getGraphFromStore,
    getGraphForExport,
  } = useGraphPersistence({});

  const graphNameToSave = ref('');
  const fileInputRef = ref<HTMLInputElement | null>(null);

  // UI handler: Save graph
  const handleSaveGraph = () => {
    if (!graphNameToSave.value.trim()) {
      alert("Please enter a name for the graph to save.");
      return;
    }
    emit('save-graph-request', graphNameToSave.value);
  };

  // UI handler: Load graph
  const handleLoadGraph = (name: string) => {
    const graphState = getGraphFromStore(name);
    if (graphState) {
      emit('load-graph-request', { nodes: graphState.nodes, edges: graphState.edges });
      graphNameToSave.value = name;
    } else {
      alert(`Failed to load graph: ${name}`);
    }
  };

  // UI handler: Download graph as JSON
  const handleDownloadGraph = (graphName: string) => {
    const graphState = getGraphForExport(graphName);
    if (graphState) {
      const jsonString = JSON.stringify(graphState, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `${graphName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } else {
      alert(`Failed to retrieve graph data for "${graphName}" for download.`);
    }
  };

  // UI handler: Delete graph
  const handleDeleteGraph = (name: string) => {
    if (confirm(`Are you sure you want to delete the graph "${name}"?`)) {
      savedGraphsStore.deleteGraph(name);
      if (graphNameToSave.value === name) {
        graphNameToSave.value = '';
      }
    }
  };

  // UI handler: Trigger file input for upload
  const triggerFileInput = () => {
    fileInputRef.value?.click();
  };

  // UI handler: Handle file upload and emit event
  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result as string;
          const parsedGraphState: SavedGraphState = JSON.parse(fileContent);

          if (
            parsedGraphState &&
            typeof parsedGraphState.name === 'string' &&
            Array.isArray(parsedGraphState.nodes) &&
            Array.isArray(parsedGraphState.edges) &&
            Array.isArray(parsedGraphState.algPresets)
          ) {
            emit('load-graph-from-file-request', parsedGraphState);
          } else {
            alert('Invalid graph file format.');
          }
        } catch (error) {
          console.error('Error parsing uploaded graph file:', error);
          alert('Failed to parse graph file. Ensure it is a valid JSON export.');
        } finally {
          if (target) {
            target.value = '';
          }
        }
      };
      reader.onerror = () => {
        alert('Error reading file.');
        if (target) {
          target.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  return {
    graphNameToSave,
    fileInputRef,
    handleSaveGraph,
    handleLoadGraph,
    handleDownloadGraph,
    handleDeleteGraph,
    triggerFileInput,
    handleFileUpload,
  };
}
