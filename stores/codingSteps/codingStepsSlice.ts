import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api";

export type StepsData = {
    question_id: number;
    question_step_number: number;
};

export interface CodingStepsState {
    data: StepsData[];
    error: null | any;
    loading: boolean;
}

const initialState: CodingStepsState = {
    data: [],
    error: null,
    loading: false,
};

export const codingStepsSlice = createSlice({
    name: "codingSteps",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addMatcher(api.endpoints.getDsaStepsById.matchPending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addMatcher(api.endpoints.getDsaStepsById.matchFulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.data = action.payload;
            })
            .addMatcher(api.endpoints.getDsaStepsById.matchRejected, (state, action) => {
                state.loading = false;
                state.data = [];
                state.error = action.error;
            });
    },
});

export default codingStepsSlice.reducer;








