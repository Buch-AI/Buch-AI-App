import React from 'react';
import { View } from 'react-native';
import { ThemedText } from './ThemedText';

export interface WorkflowState {
  creationId: string | null;
  currentStep: 'idle' | 'generating-story' | 'generating-images' | 'completed';
  error: string | null;
}

interface WorkflowStatusBoxProps {
  workflowState: WorkflowState;
  workflowStatusMessages: Record<WorkflowState['currentStep'], string>;
}

function isInitialStep(step: string): boolean {
  return step === 'idle' || step.includes('idle') || step.includes('initial') || step.includes('not_started');
}

function isTerminalStep(step: string): boolean {
  return step === 'completed' || step.includes('complete') || step.includes('done') || step.includes('finished');
}

function getStatusColor(currentStep: string): string {
  if (isInitialStep(currentStep)) {
    return 'bg-gray-100 dark:bg-gray-800';
  }

  if (isTerminalStep(currentStep)) {
    return 'bg-green-100 dark:bg-green-900';
  }

  return 'bg-yellow-100 dark:bg-yellow-900';
}

function getProgress<T extends string>(currentStep: T, allSteps: Record<T, string>): number {
  const steps = Object.keys(allSteps) as T[];

  // Filter out initial and terminal states from progress calculation
  const workflowSteps = steps.filter((step) => !isInitialStep(step) && !isTerminalStep(step));

  if (isInitialStep(currentStep)) {
    return 0;
  }

  if (isTerminalStep(currentStep)) {
    return 100;
  }

  const currentStepIndex = workflowSteps.indexOf(currentStep as T);
  if (currentStepIndex === -1) return 0;

  const totalSteps = workflowSteps.length;
  return Math.round((currentStepIndex / totalSteps) * 100);
}

export function WorkflowStatusBox({ workflowState, workflowStatusMessages }: WorkflowStatusBoxProps) {
  const { currentStep, creationId } = workflowState;
  const isInProgress = !isInitialStep(currentStep) && !isTerminalStep(currentStep);

  return (
    <View className={`mt-2 rounded-lg p-4 ${getStatusColor(currentStep)}`}>
      {/* Debug State Information */}
      <View className="flex-row items-center justify-between">
        <ThemedText className="mt-2 w-full text-left font-mono text-xs opacity-50">
          workflowState.currentStep = "{currentStep}"
        </ThemedText>
      </View>

      <View className="flex-row items-center justify-between">
        {/* Additional Status Details */}
        <ThemedText className="mt-2 w-full text-left font-mono text-xs opacity-50">
          workflowState.creationId  = "{creationId}"
        </ThemedText>
      </View>

      <View className="flex-row items-center justify-between">
        <ThemedText className="mt-2 w-full text-left font-medium">
          Status: {workflowStatusMessages[currentStep]}
        </ThemedText>
        {isInProgress && (
          <ThemedText className="text-sm opacity-70">
            {getProgress(currentStep, workflowStatusMessages)}%
          </ThemedText>
        )}
      </View>

      {/* Progress Bar */}
      {isInProgress && (
        <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <View
            className="h-full bg-blue-500 dark:bg-blue-400"
            style={{ width: `${getProgress(currentStep, workflowStatusMessages)}%` }}
          />
        </View>
      )}
    </View>
  );
}
