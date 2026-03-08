import {Card, Container, Title} from "@mantine/core";
import BackButton from "@/app/_components/navigation/backButton/BackButton";
import {useAnalysis} from "@/lib/swr";
import SimulationVisualization from "@/app/_components/home/simulation/SimulationVisualization";
import PromptDisplay from "@/app/_components/home/promptDisplay/PromptDisplay";
import Link from "next/link";


interface Props {
    params: Promise<{ "sim-id": string }>;
}

export default async function SimulationPage({params}: Props) {
    const {"sim-id": simulationId} = await params;

    return (
        <Container size="lg" py="xl">
            <Link href={"/sims"}>
                <BackButton mb={15}/>
            </Link>
            <Card mt={20}>
                <PromptDisplay id={simulationId}/>
            </Card>
            <Card style={{minHeight: "400px", minWidth: 0}} mt={20}>
                <SimulationVisualization id={simulationId}/>
            </Card>
        </Container>
    );
}