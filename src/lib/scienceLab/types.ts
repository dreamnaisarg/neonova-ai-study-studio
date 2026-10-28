export * from './labSimulationEngine';
export * from './threeDLabRoomBuilder';

export interface LaboratoryProgress {
  completedExperiments: string[];
  unlockedBadges: string[];
  quizScores: Record<string, number>;
  labNotebookEntries: {
    experimentId: string;
    timestamp: string;
    notes: string;
    observations: string[];
    grade: string;
  }[];
  equippedPPE: {
    goggles: boolean;
    mask: boolean;
    gloves: boolean;
    coat: boolean;
  };
}

export interface PlayerControlsState {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  isPointerLocked: boolean;
}
