import {Container, Title} from "@mantine/core";
import BackButton from "@/app/_components/navigation/backButton/BackButton";


interface Props {
    params: Promise<{ "sim-id": string }>;
}

export default async function SimulationPage({params}: Props) {
    const {"sim-id": simulationId} = await params;
    // const simulation = await getSimulation(simulationId);


    return (
        <Container size="lg" py="xl">
            <BackButton mb={15}/>
            <Title order={3}>Show visualization with id {simulationId} here</Title>
            {/*<SimulationVisualization data={simulation} />*/}
        </Container>
    );
}