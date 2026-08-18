import type { PseudocodeBlock } from '../../types';

export const pseudocode: Record<string, PseudocodeBlock[]> = {
  insert: [
    { line: 1, text: 'function insert(array, value, index):', indent: 0 },
    { line: 2, text: '  if index < 0 or index > array.length:', indent: 1 },
    { line: 3, text: '    return error "Index out of bounds"', indent: 2 },
    { line: 4, text: '  for i = array.length down to index + 1:', indent: 1 },
    { line: 5, text: '    array[i] = array[i - 1]', indent: 2 },
    { line: 6, text: '  array[index] = value', indent: 1 },
    { line: 7, text: '  array.length = array.length + 1', indent: 1 },
    { line: 8, text: '  return array', indent: 1 },
  ],
  delete: [
    { line: 1, text: 'function delete(array, index):', indent: 0 },
    { line: 2, text: '  if index < 0 or index >= array.length:', indent: 1 },
    { line: 3, text: '    return error "Index out of bounds"', indent: 2 },
    { line: 4, text: '  deletedValue = array[index]', indent: 1 },
    { line: 5, text: '  for i = index to array.length - 2:', indent: 1 },
    { line: 6, text: '    array[i] = array[i + 1]', indent: 2 },
    { line: 7, text: '  array.length = array.length - 1', indent: 1 },
    { line: 8, text: '  return array', indent: 1 },
  ],
  search: [
    { line: 1, text: 'function linearSearch(array, target):', indent: 0 },
    { line: 2, text: '  for i = 0 to array.length - 1:', indent: 1 },
    { line: 3, text: '    if array[i] == target:', indent: 2 },
    { line: 4, text: '      return i', indent: 3 },
    { line: 5, text: '  return -1  // not found', indent: 1 },
  ],
  update: [
    { line: 1, text: 'function update(array, index, value):', indent: 0 },
    { line: 2, text: '  if index < 0 or index >= array.length:', indent: 1 },
    { line: 3, text: '    return error "Index out of bounds"', indent: 2 },
    { line: 4, text: '  array[index] = value', indent: 1 },
    { line: 5, text: '  return array', indent: 1 },
  ],
  traverse: [
    { line: 1, text: 'function traverse(array):', indent: 0 },
    { line: 2, text: '  for i = 0 to array.length - 1:', indent: 1 },
    { line: 3, text: '    visit(array[i])', indent: 2 },
    { line: 4, text: '  return', indent: 1 },
  ],
};