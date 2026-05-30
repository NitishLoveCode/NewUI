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

  }),
});


export const { useGetmy_structure_dsa_topicQuery } = api;