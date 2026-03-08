"use client";
import {useHistory} from "@/lib/swr";
import {
    Container,
    Title,
    Stack,
    Card,
    Text,
    Skeleton,
    Group,
    Badge,
    NumberFormatter,
    Spoiler,
    Grid, GridCol
} from "@mantine/core";
import Link from "next/link";

export default function SimulationPage() {
    const {items, isLoading, error} = useHistory();

    return (
        <Container size="lg" py="xl">
            <Title order={3} mb="md">Previous Simulations</Title>

            {isLoading && (
                <Stack>
                    {Array.from({length: 4}).map((_, i) => (
                        <Skeleton key={i} h={70} radius="md"/>
                    ))}
                </Stack>
            )}

            {error && <Text c="red">{error}</Text>}

            {!isLoading && !error && items.length === 0 && (
                <Text c="dimmed">No simulations yet.</Text>
            )}

            {!isLoading && <Stack>
                {items.map((el) => (
                    <Link key={el._id} href={`/sims/${el._id}`} style={{textDecoration: "none"}}>
                        <Card withBorder padding="md" radius="md">
                            <Grid justify={"space-between"}>
                                <GridCol span={{base: 12, sm: 8, lg: 9}}>
                                    <Stack>
                                        <Text fw={500}>{el.parsedTrade?.ticker ?? "Unknown ticker"}</Text>
                                        <Spoiler maxHeight={50} showLabel="Show more" hideLabel="Hide">
                                            <Text size="sm" c="dimmed">
                                                {el.rawText}
                                            </Text>
                                        </Spoiler>
                                        <Text size="sm" c="dimmed">
                                            {new Date(el.createdAt).toLocaleString()}
                                        </Text>
                                    </Stack>
                                </GridCol>
                                <GridCol span={{base: 12, sm: 4, lg: 3}}>
                                    <Stack>
                                        <Badge size="lg" color={"red"}>
                                            Flags: {el.flags.length}
                                        </Badge>
                                        {el.simulationResult?.summary?.probProfit &&
                                            <Badge size="lg" color={"#6366f1"} w={240}>
                                                Profit Probability: <NumberFormatter
                                                value={Number(el.simulationResult?.summary?.probProfit) * 100}
                                                suffix="%" decimalScale={2}/>
                                            </Badge>}
                                    </Stack>
                                </GridCol>

                            </Grid>
                        </Card>
                    </Link>
                ))}
            </Stack>}
        </Container>
    );
}