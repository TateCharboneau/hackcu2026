"use client";
import useSWR, {Fetcher} from "swr";
import {ParsedTrade} from "@/types/trade";

type ApiResponse<T> = { data: T };

const fetcher: Fetcher<any> = (url: string) => fetch(url).then(res => res.json());

const postFetcher = <TBody>(body: TBody): Fetcher<any> =>
    (url: string) =>
        fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        }).then(res => res.json());

// export function useUser() {
//     const {data, error, isLoading} = useSWR<ApiResponse<any>>(`/api/dashboard/profile_info`, fetcher);
//
//     // console.log("SWR User Data", data);
//
//     return {
//         user: !data || !data.data ? null : data.data,
//         isLoading,
//         isError: error
//     };
// }


export function usePostAnalyze(body: {text?: string, url?: string}) {
    const {data, error, isLoading} = useSWR<ApiResponse<any>>(
        `/api/analyze`,
        postFetcher(body)
    );

    return {
        trade: !data ? null : data,
        isLoading,
        isError: error
    };
}

export function usePostSimulate<TBody>(body: ParsedTrade) {
    const {data, error, isLoading} = useSWR<ApiResponse<any>>(
        `/api/simulate`,
        postFetcher(body)
    );

    return {
        sim: !data ? null : data,
        isLoading,
        isError: error
    };
}




