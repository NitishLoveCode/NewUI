import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";



// endpoint: http://localhost:3000/api/v1/get-dsa-steps-by-id?id=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const supabase = await createClient();
   let { data, error } = await supabase
    .from('my_structure_dsa_question_topics')
    .select('question_id, question_step_number')
    .eq('my_structure_dsa_topic_id', id)

  return NextResponse.json({data, error });
}