import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type GameQuestionStep = {
    question_id: number;
    question_step_number: number;
};

export type ActiveStepState = {
    stepName: string | null;
    stepNumber: number | null;
    activeProblemNumber: number | null;
    gameSteps: GameQuestionStep[];
};

const initialState: ActiveStepState = {
    stepName: null,
    stepNumber: null,
    activeProblemNumber: null,
    gameSteps: [],
};



const activeStepSlice = createSlice({
    name: 'activeStep',
    initialState,
    reducers: {
        setStepName: (state, action: PayloadAction<{ stepName: string | null }>) => {
            state.stepName = action.payload.stepName;
        },
        setStepNumber: (state, action: PayloadAction<{ stepNumber: number | null }>) => {
            state.stepNumber = action.payload.stepNumber;
        },
        setActiveProblemNumber: (state, action: PayloadAction<{ activeProblemNumber: number | null }>) => {
            state.activeProblemNumber = action.payload.activeProblemNumber;
        },
        setGameSteps: (state, action: PayloadAction<{ gameSteps: GameQuestionStep[] }>) => {
            state.gameSteps = action.payload.gameSteps;
        },
        hydrateActiveStep: (_state, action: PayloadAction<ActiveStepState>) => action.payload,
        reset: () => initialState,
    }
});

export const {
    setStepName,
    setStepNumber,
    setActiveProblemNumber,
    setGameSteps,
    hydrateActiveStep,
    reset,
} = activeStepSlice.actions;
export default activeStepSlice.reducer;