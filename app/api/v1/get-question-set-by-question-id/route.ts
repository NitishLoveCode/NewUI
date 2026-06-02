import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";



// Question
export interface Question {
  id: number;
  title: string;
  slug: string;
  statement: string;
  difficulty: "easy" | "medium" | "hard";
  is_premium: boolean;
  is_published: boolean;
  created_by: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  description: string | null;
  thumbnail_url: string | null;
}

// Solution
export interface Solution {
  id: number;
  question_id: number;
  language: string;
  language_label: string;
  solution_code: string;
  explanation: string;
  time_complexity: string;
  space_complexity: string;
  is_default: boolean;
  created_at: string; // ISO date string
}

// Starter Code
export interface StarterCode {
  id: number;
  question_id: number;
  language: string;
  language_label: string;
  starter_code: string;
  is_default: boolean;
  created_at: string; // ISO date string
}

// API Response Wrapper
export type QuestionDetailsResponse = {
  question: Question[];
  solutions: Solution[];
  starterCode: StarterCode[];
};

export type QuestionDetailsApiPayload = {
  question?: Question[] | null;
  solutions?: Solution[] | null;
  starterCode?: StarterCode[] | null;
  questionError?: string | null;
  solutionsError?: string | null;
  starterCodeError?: string | null;
};





// endpoint: http://localhost:3000/api/v1/get-question-set-by-question-id?id=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const supabase = await createClient();
   let { data:question, error:questionError } = await supabase
    .from('dsa_questions')
    .select('*')
    .eq('id', id)

    let { data:solutions, error:solutionsError } = await supabase
    .from('dsa_solutions')
    .select('*')
    .eq('question_id', id)

    let { data:starterCode, error:starterCodeError } = await supabase
    .from('dsa_starter_codes')
    .select('*')
    .eq('question_id', id)

    return NextResponse.json(
        {
            question, 
            questionError, 
            solutions, 
            solutionsError, 
            starterCode, 
            starterCodeError 
        });
}









