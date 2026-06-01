import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";
import { dsaTopic } from "@/types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: supabaseBaseQuery,
  // tagTypes: ["Game", "User"],
  endpoints: (build) => ({

    // get all DSA topics for the user
    getmy_structure_dsa_topic: build.query({
      query: () => ({
        method: "select",
        table: "my_structure_dsa_topic",
        params: {columns: "step_name, id"}
      }),
      transformResponse: (response: { data: dsaTopic[] }) =>
        response?.data?.map((item) => ({ step_name: item.step_name, id: item.id })) || [],
      }),

    // Get question data by ID
    getmy_structure_dsa_question_topics: build.query({
      query: (id: string) => ({
        method: "select",
        table: "my_structure_dsa_question_topics",
        params: { 
        columns: "question_id, question_step_number", 
        my_structure_dsa_topic_id: `eq.${id}` 
      }
      }),
      transformResponse: (response: { data: any[] }) => response || null,
    }),

    // get question data for a specific topic ID.
    getDsaQuestion: build.query({
      query: (id: string) => ({
        method: "select",
        table: "dsa_questions",
        params: { 
        columns: "*", 
        id: `eq.${id}` 
      }
      }),
      transformResponse: (response: { data: any[] }) => response || null,
    }),

  }),
});


export const { useGetmy_structure_dsa_topicQuery, 
  useGetmy_structure_dsa_question_topicsQuery,
  useGetDsaQuestionQuery
 } = api;