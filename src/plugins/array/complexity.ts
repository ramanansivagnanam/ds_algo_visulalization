import type { ComplexityInfo } from '../../types';

export const complexity: Record<string, ComplexityInfo> = {
  insert: {
    time: 'O(n)',
    space: 'O(1)',
    description: 'Insertion requires shifting O(n) elements to the right in the worst case (inserting at index 0). Best case O(1) when inserting at the end.',
  },
  delete: {
    time: 'O(n)',
    space: 'O(1)',
    description: 'Deletion requires shifting O(n) elements to the left in the worst case. Best case O(1) when deleting from the end.',
  },
  search: {
    time: 'O(n)',
    space: 'O(1)',
    description: 'Linear search checks each element one by one, visiting O(n) elements in the worst case.',
  },
  update: {
    time: 'O(1)',
    space: 'O(1)',
    description: 'Array provides O(1) random access, so updating any element by index is a constant-time operation.',
  },
  traverse: {
    time: 'O(n)',
    space: 'O(1)',
    description: 'Traversal visits each of the n elements exactly once.',
  },
};