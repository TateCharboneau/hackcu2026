"use client";
import Image from "next/image";
import styles from "./page.module.css";
import {Box, Button, Card, Container, Paper, Stack, Text, Title} from "@mantine/core";
import HomeTabs from "@/app/_components/home/tabs/HomeTabs";
import {bitcount} from "@/app/fonts";
import {useSession} from "next-auth/react";

export default function Home() {

    const {data: session, update, status} = useSession();

    return (
        <>
            <Container size="md">
                <Stack>
                    {session?.user && <Title order={3}>Welcome Back, {session.user.name}</Title>}
                    <Card>
                        <Text>
                            In a world of of rugpulls and pump-and-dumps, TradeTruth stands for transparency. Our tool
                            allows you to analyze various forms of financial advice to scan for potential red flags and
                            allow you to avoid malicious actors.
                        </Text>
                    </Card>
                    <HomeTabs/>
                </Stack>
            </Container>
        </>
    );
}
