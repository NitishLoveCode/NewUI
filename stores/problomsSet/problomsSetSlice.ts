import { QuestionDetailsResponse } from "@/app/api/v1/get-question-set-by-question-id/route";
import { api } from "../api";
import { createSlice } from "@reduxjs/toolkit";




const initialState: QuestionDetailsResponse = {
    question: [],
    solutions: [],
    starterCode: []
};


export const problomsSetSlice = createSlice({
    name: "problomsSet",
    initialState,
    reducers:{},
    extraReducers: (builder) => {
        builder
        .addMatcher(api.endpoints.getDsaQuestions.matchPending, (state) => {
            state.question = [];
            state.solutions = [];
            state.starterCode = [];
        })
        .addMatcher(api.endpoints.getDsaQuestions.matchFulfilled, (state, action) => {
            state.question = action.payload.question;
            state.solutions = action.payload.solutions;
            state.starterCode = action.payload.starterCode;
        })
        .addMatcher(api.endpoints.getDsaQuestions.matchRejected, (state, action) => {
            state.question = [];
            state.solutions = [];
            state.starterCode = [];
        });
    },
});


export default problomsSetSlice.reducer;