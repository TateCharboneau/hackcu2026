"use client";
import {Tabs, TextInput, Textarea, Button, Stack, FileInput, Card, Skeleton, Text} from "@mantine/core";
import {useEffect, useState} from "react";
import LoadingOverlay from "@/app/_components/home/loading/LoadingOverlay";
import {AnalysisDocument} from "@/types/trade";
import {useAnalysis} from "@/lib/swr";
import SimulationVisualization from "@/app/_components/home/simulation/SimulationVisualization";
import {useRouter, useSearchParams} from "next/navigation";


export default function HomeTabs() {
    const searchParams = useSearchParams();
    const idFromUrl = searchParams.get("id");

    //states for each input type
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const router = useRouter();

    //state for tracking API call status and results
    const [loading, setLoading] = useState(false);
    const [resultId, setResultId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch the full analysis document once we have an ID
    const { item: result, isLoading: resultLoading } = useAnalysis(resultId ?? idFromUrl);


    // Shared helper: call analyze then (if financial) simulate, returning the doc ID
    const analyzeAndSimulate = async (
        analyzeInit: RequestInit,
    ): Promise<void> => {
        setLoading(true);
        setError(null);
        setResultId(null);
        try {
            // 1. Analyze
            const analyzeRes = await fetch('/api/analyze', analyzeInit);
            if (!analyzeRes.ok) throw new Error('Analysis failed');
            const analyzeData = await analyzeRes.json();

            // 2. Non-financial input → early exit
            if (!analyzeData.isFinancial) {
                setError(analyzeData.explanation ?? 'Input does not appear to be financial advice.');
                return;
            }

            // 3. Simulate (server loads parsedTrade from DB by ID)
            const simRes = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: analyzeData.id }),
            });
            if (!simRes.ok) throw new Error('Simulation failed');

            // 4. Set the ID so useAnalysis fetches the complete document
            setResultId(analyzeData.id);
            router.replace("/?id=" + analyzeData.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (!url.trim()) return;
        return analyzeAndSimulate({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
    };

    const handleTextSubmit = () => {
        if (!text.trim()) return;
        return analyzeAndSimulate({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
    };

    const handleFileSubmit = () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('audio', file);
        return analyzeAndSimulate({
            method: 'POST',
            body: formData,
        });
    };

    return (<>
            {loading && <LoadingOverlay/>}
            {/*@ts-expect-error This works, but says you can't do align on Card*/}
            <Card style={{minHeight: "400px"}} align={"center"}>
                <Tabs defaultValue="url">
                    <Tabs.List>
                        <Tabs.Tab value="url">URL</Tabs.Tab>
                        <Tabs.Tab value="text">Text</Tabs.Tab>
                        <Tabs.Tab value="file">Audio File</Tabs.Tab>
                    </Tabs.List>

                    {/* URL Tab */}
                    <Tabs.Panel value="url" pt="md">
                        <Stack>
                            <TextInput
                                label="Content URL"
                                description="Link to a Youtube, Twitch, Instagram, or Tiktok clip containing financial advice"
                                placeholder="https://youtube.com/watch?v=..."
                                value={url}
                                onChange={(e) => setUrl(e.currentTarget.value)}
                            />
                            <Button onClick={handleUrlSubmit}>Analyze</Button>
                        </Stack>
                    </Tabs.Panel>

                    {/* Text Tab */}
                    <Tabs.Panel value="text" pt="md">
                        <Stack>
                            <Textarea
                                label="Paste financial advice"
                                description="Paste any text — a newsletter, post, transcript, etc."
                                placeholder="Paste the text you want to analyze..."
                                minRows={6} // sets the minimum visible height of the textarea
                                value={text}
                                onChange={(e) => setText(e.currentTarget.value)}
                            />
                            <Button onClick={handleTextSubmit}>Analyze</Button>
                        </Stack>
                    </Tabs.Panel>

                    {/* File Tab */}
                    <Tabs.Panel value="file" pt="md">
                        <Stack>
                            <FileInput
                                label="Upload audio or video file"
                                description="Accepted formats: MP3, MP4, M4A"
                                placeholder="Click to select a file"
                                // accept restricts the file picker to these MIME types only
                                accept="audio/mpeg,video/mp4,audio/mp4,audio/x-m4a"
                                value={file}
                                // FileInput returns the File object directly (no event wrapper)
                                onChange={setFile}
                            />
                            {/* Disable the button until a file has been selected */}
                            <Button onClick={handleFileSubmit} disabled={!file}>
                                Analyze
                            </Button>
                        </Stack>
                    </Tabs.Panel>

                </Tabs>
            </Card>

            {/*@ts-expect-error This works, but says you can't do align on Card*/}
            {(loading || resultLoading) && <Card style={{minHeight: "400px"}} align={"center"} mt={20}>
                <Skeleton w={"100%"} h={400} />
            </Card>}

            {/*@ts-expect-error This works, but says you can't do align on Card*/}
            {!loading && !resultLoading && error && <Card style={{minHeight: "400px"}} align={"center"} mt={20}>
                <Text c={"red"}>{error}</Text>
            </Card>}

            {!loading && !resultLoading && result && <Card style={{minHeight: "400px", minWidth: 0}} mt={20}>
                <SimulationVisualization data={result.simulationResult} capital={result.parsedTrade?.capital}/>
            </Card>}
        </>
    );
}

