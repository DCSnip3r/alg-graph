import { ref } from 'vue';

export function useCollapsible(initialState = true) {
  const isVisible = ref(initialState);

  const toggleVisibility = () => {
    isVisible.value = !isVisible.value;
  };

  return { isVisible, toggleVisibility };
}
