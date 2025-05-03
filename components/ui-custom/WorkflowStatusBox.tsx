import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';

export interface WorkflowState {
  creationId: string | null;
  currStep: string;
  error: string | null;
}

interface WorkflowStatusBoxProps {
  workflowState: WorkflowState;
  workflowStatusMessages: Record<WorkflowState['currStep'], string>;
  className?: string;
}

function isInitialStep(step: string): boolean {
  return step === 'idle' || step.includes('idle') || step.includes('initial') || step.includes('not_started');
}

function isTerminalStep(step: string): boolean {
  return step === 'completed' || step.includes('complete') || step.includes('done') || step.includes('finished');
}

function getStatusColor(currStep: string): string {
  if (isInitialStep(currStep)) {
    return 'bg-gray-100 dark:bg-gray-800';
  }

  if (isTerminalStep(currStep)) {
    return 'bg-green-100 dark:bg-green-900';
  }

  return 'bg-yellow-100 dark:bg-yellow-900';
}

function getProgress<T extends string>(currStep: T, allSteps: Record<T, string>): number {
  const steps = Object.keys(allSteps) as T[];

  // Filter out initial and terminal states from progress calculation
  const workflowSteps = steps.filter((step) => !isInitialStep(step) && !isTerminalStep(step));

  if (isInitialStep(currStep)) {
    return 0;
  }

  if (isTerminalStep(currStep)) {
    return 100;
  }

  const currStepIndex = workflowSteps.indexOf(currStep as T);
  if (currStepIndex === -1) return 0;

  const totalSteps = workflowSteps.length;
  return Math.round((currStepIndex / totalSteps) * 100);
}

export function WorkflowStatusBox({ workflowState, workflowStatusMessages, className }: WorkflowStatusBoxProps) {
  const { currStep, creationId } = workflowState;
  const isInProgress = !isInitialStep(currStep) && !isTerminalStep(currStep);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View className={`rounded-lg p-4 ${getStatusColor(currStep)} shadow-custom ${className}`}>
      <View>
        <ThemedText className="w-full text-left font-medium">
          Status: {workflowStatusMessages[currStep]}
        </ThemedText>
      </View>

      {isInProgress && (
        <View className="mt-2 flex-row items-center">
          <View className="h-2 flex-1 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
            <View
              className="h-full bg-blue-500 dark:bg-blue-400"
              style={{ width: `${getProgress(currStep, workflowStatusMessages)}%` }}
            />
          </View>
          <View className="ml-4">
            <ThemedText className="text-sm opacity-70">
              {getProgress(currStep, workflowStatusMessages)}%
            </ThemedText>
          </View>
        </View>
      )}

      {/* Toggle Details Button */}
      <TouchableOpacity
        onPress={() => setShowDetails(!showDetails)}
        className="mt-1"
      >
        <ThemedText className="text-xs text-blue-600 dark:text-blue-400">
          {showDetails ? 'Hide Details' : 'Show Details'}
        </ThemedText>
      </TouchableOpacity>

      {showDetails && (
        <View className="mt-1">
          <View className="flex-row items-center justify-between">
            <ThemedText className="w-full text-left font-mono text-xs opacity-50">
              creationId = "{creationId}"
            </ThemedText>
          </View>
          <View className="flex-row items-center justify-between">
            <ThemedText className="w-full text-left font-mono text-xs opacity-50">
              currStep   = "{currStep}"
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}
