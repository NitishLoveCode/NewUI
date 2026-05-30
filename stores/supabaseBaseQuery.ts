import type {BaseQueryFn} from '@reduxjs/toolkit/query';
import {createClient} from "../lib/supabase/client";



const supabase = createClient();

export const supabaseBaseQuery: BaseQueryFn<
{method: string, table: string, params?: any}, 
unknown, 
unknown> = async ({method, table, params}) => {
    try{
        let result;
        if(method === 'select'){
            result = await supabase.from(table).select(params?.columns || '*');
        } else if(method === 'insert'){
            result = await supabase.from(table).insert(params?.data);
        } else if(method === 'update'){
            result = await supabase.from(table).update(params?.data).eq('id', params?.id);
        } else if(method === 'delete'){
            result = await supabase.from(table).delete().eq('id', params?.id);
        }else{
            throw new Error(`Unsupported method: ${method}`);
        }

        if(result.error){
            return {error: result.error.message};
        }
        return {data: result.data};
    } catch (error) {
        return {error: error instanceof Error ? error.message : String(error)};
    }

}