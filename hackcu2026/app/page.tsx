import Image from "next/image";
import styles from "./page.module.css";
import {Button, Container, Stack, Title} from "@mantine/core";
import HomeTabs from "@/app/_components/home/tabs/HomeTabs";
import {bitcount} from "@/app/fonts";

export default function Home() {
    return (
        <>
            <Container size="md">
                <Stack>
                    <Title className={bitcount.className} order={1}>Trade Truth</Title>


                    <HomeTabs/>
                </Stack>
            </Container>
        </>
    );
}
