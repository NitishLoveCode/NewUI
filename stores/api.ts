import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";
import { dsaTopic } from "@/types";
import { Question, QuestionDetailsApiPayload, QuestionDetailsResponse, Solution, StarterCode } from "@/app/api/v1/get-question-set-by-question-id/route";
import { apiUrl } from "@/lib/backendConfig";
import type {
  RunCodeRequest,
  RunCodeResponse,
  RuntimesResponse,
} from "@/types/collab";

type DsaRecord = Record<string, unknown>;
type CodingStep = {
  question_id: number;
  question_step_number: number;
};

type DsaQuestionDetails = {
  question: DsaRecord | null;
  solutions: DsaRecord[];
  starterCode?: DsaRecord | null;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: supabaseBaseQuery,
  // tagTypes: ["Game", "User"],
  endpoints: (build) => ({

    getDsaStepsById: build.query<CodingStep[], string | number>({
      async queryFn(id) {
        try {
          const response = await fetch(`/api/v1/get-dsa-steps-by-id?id=${id}`);
          const result = (await response.json()) as {
            data?: CodingStep[] | null;
            error?: { message?: string } | string | null;
          };

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: result,
              },
            };
          }

          if (result.error) {
            return {
              error: {
                status: 500,
                data: result.error,
              },
            };
          }

          return { data: Array.isArray(result.data) ? result.data : [] };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              data: error instanceof Error ? error.message : String(error),
            },
          };
        }
      },
    }),

   getDsaQuestions: build.query<QuestionDetailsResponse, string | number>({
      async queryFn(id) {
        try {
          const response = await fetch(`/api/v1/get-question-set-by-question-id?id=${id}`);
          const result = (await response.json()) as QuestionDetailsApiPayload;

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: result,
              },
            };
          }

          if (result.questionError || result.solutionsError || result.starterCodeError) {
            return {
              error: {
                status: 500,
                data: {
                  questionError: result.questionError,
                  solutionsError: result.solutionsError,
                  starterCodeError: result.starterCodeError,
                },
              },
            };
          }

          return {
            data: {
              question: Array.isArray(result.question) ? result.question : [],
              solutions: Array.isArray(result.solutions) ? result.solutions : [],
              starterCode: Array.isArray(result.starterCode) ? result.starterCode : [],
            },
          };
        } catch (error) {
          return {
            error: {
              status: 500,
              data: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
    }),

    // ---------------------------------------------------------------
    // nodeServer: code execution
    // ---------------------------------------------------------------
    // RTK Query mutation: triggers a side effect (running code) rather than
    // a cached read. Use it as: const [runCode, { data, isLoading }] = useRunCodeMutation();
    runCode: build.mutation<RunCodeResponse, RunCodeRequest>({
      async queryFn(body) {
        try {
          const response = await fetch(apiUrl("/api/run-code"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const result = (await response.json()) as RunCodeResponse & {
            error?: string | null;
          };

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: result,
              },
            };
          }
          return { data: result };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              data: error instanceof Error ? error.message : String(error),
            },
          };
        }
      },
    }),

    // List Piston runtimes available on the backend (useful for a language picker).
    getRuntimes: build.query<RuntimesResponse, void>({
      async queryFn() {
        try {
          const response = await fetch(apiUrl("/api/runtimes"));
          const result = (await response.json()) as RuntimesResponse;
          if (!response.ok) {
            return { error: { status: response.status, data: result } };
          }
          return { data: result };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              data: error instanceof Error ? error.message : String(error),
            },
          };
        }
      },
    }),
  }),
});


export const {
  useGetDsaStepsByIdQuery,
  useGetDsaQuestionsQuery,
  useRunCodeMutation,
  useGetRuntimesQuery,
} = api;