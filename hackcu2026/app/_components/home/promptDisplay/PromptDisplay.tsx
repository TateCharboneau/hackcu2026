"use client";
import {useAnalysis} from "@/lib/swr";
import {Skeleton, Spoiler, Text, Title} from "@mantine/core";

interface Props {
    id: string;
}

export default function PromptDisplay({id}: Props) {
    const { item: result, isLoading: resultLoading } = useAnalysis(id ?? null);

    if(resultLoading) return(<>
        <Title order={2} mb={5}>Your Prompt</Title>
        <Skeleton h={30}/>
    </>);

    return(<>
        <Title order={2} mb={5}>Your Prompt</Title>
        <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
            <Text>{result?.rawText}</Text>
        </Spoiler>
    </>);
}