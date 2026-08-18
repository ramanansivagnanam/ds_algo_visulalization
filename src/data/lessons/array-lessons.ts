import { Lesson, Exercise } from '../../types/telemetry';

export const lessons: Lesson[] = [
  {
    id: 'array_basics',
    title: 'Array Basics',
    description: 'Learn fundamental array operations',
    difficulty: 'beginner',
    estimatedTime: 15,
    steps: [
      {
        order: 1,
        instruction: 'Create an empty array',
        expectedOperation: { type: 'create', payload: {} },
        hint: 'Use the create operation to initialize a new array',
      },
      {
        order: 2,
        instruction: 'Insert the value 5 at index 0',
        expectedOperation: { type: 'insert', payload: { index: 0, value: 5 } },
        hint: 'Use insert with index 0 and value 5',
      },
      {
        order: 3,
        instruction: 'Insert the value 10 at index 1',
        expectedOperation: { type: 'insert', payload: { index: 1, value: 10 } },
        hint: 'Add another element after the first one',
      },
      {
        order: 4,
        instruction: 'Access the element at index 0',
        expectedOperation: { type: 'access', payload: { index: 0 } },
        hint: 'Read the first element',
      },
      {
        order: 5,
        instruction: 'Update index 0 to value 7',
        expectedOperation: { type: 'update', payload: { index: 0, value: 7 } },
        hint: 'Change the first element to 7',
      },
      {
        order: 6,
        instruction: 'Delete the element at index 0',
        expectedOperation: { type: 'delete', payload: { index: 0 } },
        hint: 'Remove the first element',
      },
    ],
  },
  {
    id: 'array_traversal',
    title: 'Array Traversal',
    description: 'Practice traversing arrays',
    difficulty: 'beginner',
    estimatedTime: 10,
    steps: [
      {
        order: 1,
        instruction: 'Create an array with values [1, 2, 3, 4, 5]',
        expectedOperation: { type: 'create', payload: { initialValues: [1, 2, 3, 4, 5] } },
        hint: 'Initialize with multiple values',
      },
      {
        order: 2,
        instruction: 'Access each element sequentially',
        expectedOperation: { type: 'access', payload: { index: 0 } },
        hint: 'Start from index 0',
      },
    ],
  },
];

export const exercises: Exercise[] = [
  {
    id: 'exercise_array_1',
    title: 'Build an Array',
    description: 'Create an array containing [10, 20, 30]',
    difficulty: 'easy',
    initialPluginId: 'array',
    initialState: null,
    targetState: {
      data: [10, 20, 30],
      highlights: [],
      annotations: [],
      metadata: {},
    },
    constraints: {
      maxOperations: 10,
      requiredOperations: ['create'],
    },
    hints: [
      'Start by creating a new array',
      'You can provide initial values during creation',
    ],
  },
  {
    id: 'exercise_array_2',
    title: 'Modify an Array',
    description: 'Transform [1, 2, 3] into [1, 5, 3]',
    difficulty: 'easy',
    initialPluginId: 'array',
    initialState: {
      data: [1, 2, 3],
      highlights: [],
      annotations: [],
      metadata: {},
    },
    targetState: {
      data: [1, 5, 3],
      highlights: [],
      annotations: [],
      metadata: {},
    },
    constraints: {
      maxOperations: 5,
      requiredOperations: ['update'],
    },
    hints: [
      'You need to change the middle element',
      'Use the update operation',
    ],
  },
  {
    id: 'exercise_array_3',
    title: 'Array Manipulation Challenge',
    description: 'Starting from empty, build [7, 3, 9] then remove the middle element',
    difficulty: 'medium',
    initialPluginId: 'array',
    initialState: null,
    targetState: {
      data: [7, 9],
      highlights: [],
      annotations: [],
      metadata: {},
    },
    constraints: {
      maxOperations: 8,
      requiredOperations: ['create', 'insert', 'delete'],
    },
    hints: [
      'First create an empty array',
      'Insert elements one by one',
      'Then delete the element at index 1',
    ],
  },
];
