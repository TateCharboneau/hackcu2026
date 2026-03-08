"use client";

import {BarChart, DonutChart, LineChart} from "@mantine/charts";
import {
    Badge,
    Box,
    Divider,
    Flex,
    Grid,
    GridCol,
    Group,
    Paper,
    Skeleton,
    Stack,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import {useMemo} from "react";
import {AnalysisDocument, SimulationResult} from "@/types/trade";
import {useAnalysis} from "@/lib/swr";


interface Props {
    data?: AnalysisDocument,
    id?: string,
    capital?: number,
}

const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(v);

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function SimulationVisualization({data, id, capital}: Props) {
    const {item: result, isLoading: resultLoading} = useAnalysis(id ?? null);

    const resolvedData = id ? (result as AnalysisDocument) : data;
    const resolvedSimResult = id ? (result?.simulationResult as SimulationResult) : data;
    const resolvedCapital = capital ?? result?.parsedTrade?.capital;
    const {summary, endingValues = [], samplePaths = []} = resolvedSimResult ?? {};

    // console.log(data);
    // console.log("id:", id);
    // console.log("result:", result?.flags);
    // console.log("resultLoading:", resultLoading);

    const histogram = useMemo(() => {
        if (!endingValues.length) return [];
        const max = Math.max(...endingValues);
        const BUCKETS = 24;
        const bucketSize = max / BUCKETS;
        const counts = Array(BUCKETS).fill(0);
        endingValues.forEach((v) => {
            const idx = Math.min(Math.floor(v / bucketSize), BUCKETS - 1);
            counts[idx]++;
        });
        return [
            {bucket: 0, range: fmt(0), count: 0},
            ...counts.map((count, i) => ({
                range: fmt(i * bucketSize),
                bucket: i * bucketSize,
                count,
            }))
        ];
    }, [endingValues]);

    const pathMin = useMemo(() => {
        if (!samplePaths.length) return 0;
        const allValues = samplePaths.flat();
        const min = Math.min(...allValues);
        return min - Math.abs(min) * 0.1; // 10% padding below min
    }, [samplePaths]);

    const pathsChartData = useMemo(() => {
        if (!samplePaths.length) return [];
        const maxLen = Math.max(...samplePaths.map((p) => p.length));
        return Array.from({length: maxLen}, (_, step) => {
            const point: Record<string, number | string> = {step: `T${step}`};
            samplePaths.forEach((path, i) => {
                if (path[step] !== undefined) point[`Path ${i + 1}`] = path[step];
            });
            return point;
        });
    }, [samplePaths]);

    if (id && resultLoading) return <Skeleton h={400}/>;
    if (!summary) return null;

    const pathSeries = samplePaths.map((_, i) => ({
        name: `Path ${i + 1}`,
        color: i < 3 ? (["teal.5", "red.5", "yellow.6"] as const)[i] : "gray.4",
        strokeDasharray: i >= 3 ? "4 4" : undefined,
    }));

    const percentileBars = [
        {
            label: "5th Percentile",
            description: "5th percentile — 95% of simulations ended above this value",
            value: summary.p5,
            color: "#ef4444"
        },
        {
            label: "25th Percentile",
            description: "25th percentile — 75% of simulations ended above this value",
            value: summary.p25,
            color: "#f97316"
        },
        {
            label: "Median",
            description: "50th percentile — half of simulations ended above and below this value",
            value: summary.medianEndingValue,
            color: "#eab308"
        },
        {
            label: "Mean",
            description: "Average ending value across all simulations",
            value: summary.meanEndingValue,
            color: "#14b8a6"
        },
        {
            label: "75th Percentile",
            description: "75th percentile — 25% of simulations ended above this value",
            value: summary.p75,
            color: "#06b6d4"
        },
        {
            label: "95th Percentile",
            description: "95th percentile — only 5% of simulations ended above this value",
            value: summary.p95,
            color: "#3b82f6"
        },
    ];
    const winRate = summary.probProfit;
    const lossRate = 1 - winRate;

    const kpis = [
        {label: "Profit Probability", value: pct(summary.probProfit), note: "P(profit)", accent: "#6366f1"},
        {label: "Mean Outcome", value: fmt(summary.meanEndingValue), note: "Expected value", accent: "#3b82f6"},
        {label: "Median Outcome", value: fmt(summary.medianEndingValue), note: "50th percentile", accent: "#14b8a6"},
        {label: "Max Gain", value: fmt(summary.maxGain), note: "Best scenario", accent: "#22c55e"},
        {label: "Max Loss", value: fmt(summary.maxLoss), note: "Worst scenario", accent: "#ef4444"},
    ];

    return (
        <Stack gap="xl">
            <Stack gap="sm">
            <Group justify="space-between" align="flex-end">
                <Box>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{letterSpacing: "0.1em"}}>
                        {resolvedData?.explanation}
                    </Text>
                    <Group align="baseline" gap="xs" mt={2}>
                        <Title order={2}>Current Trade Stats</Title>
                        {resolvedData?.parsedTrade?.ticker && (
                            <Title order={2} fw={900}>— {resolvedData.parsedTrade.ticker}</Title>
                        )}
                    </Group>
                    {resolvedData?.parsedTrade?.currentPrice && (
                        <Text size="sm" c="dimmed" mt={4}>
                            Current Price: {fmt(resolvedData.parsedTrade.currentPrice)}
                        </Text>
                    )}
                </Box>
                <Stack>
                    {resolvedData?.parsedTrade?.direction && (
                        <Badge size="md" color={resolvedData.parsedTrade.direction === "bullish" ? "teal" : "red"}>
                            {resolvedData.parsedTrade.direction}
                        </Badge>
                    )}
                    {resolvedData?.parsedTrade?.assetType && (
                        <Badge size="md" color="blue">
                            {resolvedData.parsedTrade.assetType} Trade
                        </Badge>
                    )}
                    {/*<Badge size="md" variant="light" color="gray">*/}
                    {/*    n = {endingValues.length.toLocaleString()} simulations*/}
                    {/*</Badge>*/}
                </Stack>
            </Group>

            {resolvedData?.flags && resolvedData.flags.length > 0 && (
                <Box>
                    <Text size="md" c="dimmed" tt="uppercase" fw={600} style={{letterSpacing: "0.1em"}} mb={4}>
                        Flagged Phrases
                    </Text>
                    <Text size="sm" c="dimmed" mb="md">
                        The following phrases were detected as potentially misleading or harmful.
                    </Text>
                    <Stack gap="sm">
                        {resolvedData.flags.map((flag, i) => (
                            <Paper key={i} p="md" withBorder
                                   style={{borderLeft: `4px solid ${flag.severity === "high" ? "#ef4444" : flag.severity === "medium" ? "#f97316" : "#eab308"}`}}>
                                <Group justify="space-between" mb={4}>
                                    <Text size="sm" fw={600}>"{flag.phrase}"</Text>
                                    <Badge
                                        color={flag.severity === "high" ? "red" : flag.severity === "medium" ? "orange" : "yellow"}
                                        variant="light">
                                        {flag.severity}
                                    </Badge>
                                </Group>
                                <Text size="sm" c="dimmed">{flag.reason}</Text>
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            )}
            </Stack>

            <Divider/>


            {/* Header */}
            <Group justify="space-between" align="flex-end">
                <Box>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{letterSpacing: "0.1em"}}>
                        Monte Carlo Analysis
                    </Text>
                    <Title order={2} mt={2}>Simulation Results</Title>
                    <Text size="xs" c="dimmed" fw={600}>
                        Assuming: {" "}
                        {result?.parsedTrade?.assumptions.map((el, idx) => {
                            if (idx < (result?.parsedTrade?.assumptions.length ?? 0)) return el + ", ";
                            return el;
                        })}
                    </Text>
                </Box>
                <Stack>
                    <Badge size="md" variant="light" color="gray">
                        Initial Investment of {resolvedCapital != null ? fmt(resolvedCapital) : "$1,000"}
                    </Badge>
                    <Badge size="md" variant="light" color="gray">
                        n = {endingValues.length.toLocaleString()} simulations
                    </Badge>
                </Stack>
            </Group>

            {/* KPI Row */}
            <Grid grow gutter="sm">
                {kpis.map((kpi) => (
                    <GridCol span={{base: 6, sm: 3, lg: 2}} key={kpi.label}>
                        <Paper p="md" withBorder style={{borderTop: `3px solid ${kpi.accent}`}} h={150}>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={500} style={{letterSpacing: "0.08em"}}>
                                {kpi.label}
                            </Text>
                            <Text size="xl" fw={700} mt={4} style={{color: kpi.accent}}>
                                {kpi.value}
                            </Text>
                            <Text size="xs" c="dimmed" mt={2}>{kpi.note}</Text>
                        </Paper>
                    </GridCol>
                ))}
            </Grid>

            {/* Outcome Distribution */}
            <Box>
                <Text size="md" c="dimmed" tt="uppercase" fw={600} style={{letterSpacing: "0.1em"}} mb={4}>
                    Outcome Distribution
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                    Frequency of ending values across all simulations
                </Text>
                <Box style={{width: "100%", minWidth: 0, overflow: "hidden"}} p={10}>
                    <BarChart
                        h={300}
                        data={histogram}
                        dataKey="bucket"
                        series={[{name: "count", color: "violet.5", label: "Simulations"}]}
                        gridAxis="y"
                        withTooltip
                        tooltipAnimationDuration={150}
                        valueFormatter={(v) => `${v} runs`}
                        yAxisProps={{width: 50}}
                        xAxisProps={{
                            tickLine: false,
                            axisLine: false,
                            tickFormatter: (v) => fmt(v),
                            interval: 2,
                        }}
                        tooltipProps={{
                            formatter: (value) => [`${value} runs`, "Simulations"],
                            labelFormatter: (v) => fmt(v),
                        }}
                    />
                </Box>
            </Box>

            {/* Win / Loss Split */}
            <Box>
                <Text size="md" c="dimmed" tt="uppercase" fw={600} style={{letterSpacing: "0.1em"}} mb={4}>
                    Win / Loss Split
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                    Profitable vs unprofitable simulation runs
                </Text>
                <Grid justify="center" align="center">
                    <GridCol span={{base: 12, md: 6}}>
                        <Flex justify="center" align="center" mt={4}>
                            <DonutChart
                                size={180}
                                thickness={26}
                                strokeWidth={0}
                                chartLabel={pct(winRate)}
                                tooltipDataSource="segment"
                                data={[
                                    {value: winRate * 100, color: "teal.5", name: "Profitable"},
                                    {value: lossRate * 100, color: "red.5", name: "Loss"},
                                ]}
                            />
                        </Flex>
                    </GridCol>
                    <GridCol span={{base: 12, md: 6}}>
                        <Stack gap="sm">
                            {[
                                {label: "Profitable", value: pct(winRate), color: "#14b8a6"},
                                {label: "Loss / Breakeven", value: pct(lossRate), color: "#ef4444"},
                            ].map((item) => (
                                <Group key={item.label} gap="sm">
                                    <Box w={12} h={12}
                                         style={{borderRadius: 3, background: item.color, flexShrink: 0}}/>
                                    <Text size="sm" c="dimmed">{item.label}</Text>
                                    <Text size="sm" fw={600} style={{color: item.color}}>{item.value}</Text>
                                </Group>
                            ))}
                        </Stack>
                    </GridCol>
                </Grid>
            </Box>

            {/* Sample Paths */}
            <Box>
                <Text size="md" c="dimmed" tt="uppercase" fw={600} style={{letterSpacing: "0.1em"}} mb={4}>
                    Sample Paths
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                    Portfolio value over time — selected simulation runs
                </Text>
                <Box style={{width: "100%", minWidth: 0, overflow: "hidden"}}>
                    <LineChart
                        h={320}
                        data={pathsChartData}
                        dataKey="step"
                        series={pathSeries}
                        tickLine="none"
                        gridAxis="y"
                        curveType="monotone"
                        withDots={false}
                        strokeWidth={1.5}
                        withTooltip={false}
                        xAxisProps={{tick: false}}
                        yAxisProps={{width: 65, domain: [pathMin, 'auto']}}
                        valueFormatter={fmt}
                    />
                </Box>
                <Group gap="xl" mt="sm">
                    <Group gap="xs">
                        <Group gap={2}>
                            <Box style={{
                                width: 10,
                                height: 2,
                                background: "var(--mantine-color-teal-5)",
                                flexShrink: 0
                            }}/>
                            <Box style={{
                                width: 10,
                                height: 2,
                                background: "var(--mantine-color-red-5)",
                                flexShrink: 0
                            }}/>
                            <Box style={{
                                width: 10,
                                height: 2,
                                background: "var(--mantine-color-yellow-6)",
                                flexShrink: 0
                            }}/>
                        </Group>
                        <Text size="xs" c="dimmed">Featured paths</Text>
                    </Group>
                    <Group gap="xs">
                        <Box style={{
                            width: 24, height: 0, flexShrink: 0,
                            borderTop: "2px dashed var(--mantine-color-gray-4)",
                        }}/>
                        <Text size="xs" c="dimmed">Additional sample paths</Text>
                    </Group>
                </Group>
            </Box>

            {/* Percentile Ladder */}
            <Box>
                <Text size="md" c="dimmed" tt="uppercase" fw={600} style={{letterSpacing: "0.1em"}} mb={4}>
                    Percentile Ladder
                </Text>
                <Text size="sm" c="dimmed" mb="lg">
                    Distribution of final portfolio values
                </Text>
                <Stack gap="md">
                    {percentileBars.map((p) => {
                        const widthPct = Math.min(100, (p.value / summary.p95) * 100);
                        return (
                            <Box key={p.label}>
                                <Group justify="space-between" mb={6}>
                                    <Tooltip label={p.description} withArrow position="top-start" maw={260} multiline>
                                        <Group justify="space-between" mb={6}>
                                            <Text size="sm" fw={500}
                                                  style={{cursor: "help", textDecoration: "underline dotted"}}>
                                                {p.label}
                                            </Text>
                                            <Text size="sm" fw={600}>{fmt(p.value)}</Text>
                                        </Group>
                                    </Tooltip>
                                    <Text size="sm" fw={600}>{fmt(p.value)}</Text>
                                </Group>
                                <Box style={{
                                    height: 8,
                                    background: "var(--mantine-color-gray-2)",
                                    borderRadius: 4,
                                    overflow: "hidden"
                                }}>
                                    <Box
                                        style={{
                                            height: "100%",
                                            width: `${widthPct}%`,
                                            background: p.color,
                                            borderRadius: 4,
                                            transition: "width 0.6s ease",
                                        }}
                                    />
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>
                <Paper mt="xl" p="md" withBorder>
                    <Text size="md" fw={600} mb={4}>IQR (P25 → P75)</Text>
                    <Text size="sm" c="dimmed" mb={8}>
                        The interquartile range (IQR) spans the middle 50% of all simulation outcomes —
                        half of all runs landed between these two values.
                    </Text>
                    <Text size="md" c="dimmed">{fmt(summary.p25)} → {fmt(summary.p75)}</Text>
                    <Text size="sm" c="dimmed" mt={4}>Range: {fmt(summary.p75 - summary.p25)}</Text>
                </Paper>
            </Box>
        </Stack>
    );
}