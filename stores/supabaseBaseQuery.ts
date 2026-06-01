import type {BaseQueryFn} from '@reduxjs/toolkit/query';
import {createClient} from "../lib/supabase/client";



const supabase = createClient();

export const supabaseBaseQuery: BaseQueryFn<
{method: string, table: string, params?: any}, 
unknown, 
unknown> = async ({method, table, params}) => {
    try{
        let result;
        if (method === 'select') {
            let query = supabase.from(table).select(params?.columns || '*');
            // Apply filters for all params except 'columns'
            if (params) {
                            Object.entries(params).forEach(([key, value]) => {
                                if (key !== 'columns' && typeof value === 'string' && value) {
                                    // value should be like 'eq.123'
                                    const [op, val] = value.split('.');
                                    if (op === 'eq') {
                                        query = query.eq(key, val);
                                    }
                                    // Add more operators as needed (e.g., 'gt', 'lt', etc.)
                                }
                            });
            }
            result = await query;
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