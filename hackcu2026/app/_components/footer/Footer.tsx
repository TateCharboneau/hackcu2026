import {Divider, Text, Stack} from "@mantine/core";

export default function Footer() {
    return (
        <footer>
            <Divider mt="xl" mb="md"/>
            <Stack gap={4} pb="lg" align="center">
                <Text size="xs" c="dimmed" ta="center" maw={640}>
                    <strong>Disclaimer: TradeTruth does not provide financial advice.</strong> 
                </Text>
                <Text size="xs" c="dimmed">© {new Date().getFullYear()} TradeTruth</Text>
            </Stack>
        </footer>
    );      
}
