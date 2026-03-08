"use client";
import Image from "next/image";
import styles from "./page.module.css";
import {Box, Button, Card, Container, Paper, Skeleton, Stack, Text, Title} from "@mantine/core";
import HomeTabs from "@/app/_components/home/tabs/HomeTabs";
import {bitcount} from "@/app/fonts";
import {useSession} from "next-auth/react";
import LoginButton from "@/app/_components/auth/loginButton/LoginButton";

export default function Home() {

    const {data: session, update, status} = useSession();


    return (
        <>
            <Container size="md">
                <Stack>
                    {status === "loading" && <Skeleton w={300} h={30}/>}
                    {session?.user && <Title order={3}>Welcome Back, {session.user.name}</Title>}
                    <Card>
                        <Text size={"lg"}>
                            The modern financial world can be full of noise, hype and speculation. TradeTruth
                            allows you to analyze various forms of financial advice to scan for potential red flags and
                            allow you to avoid malicious actors. Paste in a tip, a tweet or a trade strategy and 
                            we'll run a simulation to show you the realistic range of outcomes. 
                            Make informed decisions, not faith-based ones.
                        </Text>
                    </Card>

                    {/*@ts-expect-error This works, but says you can't do align on Card*/}
                    {status === "loading" && <Card style={{minHeight: "400px"}} align={"center"}><Skeleton w={"auto"} h={300}/></Card>}
                    {!session?.user && status !== "loading" && <>
                        {/*@ts-expect-error This works, but says you can't do align on Card*/}
                        <Card style={{minHeight: "400px"}} align={"center"}>
                            <Stack gap={20}>
                                <Text fw={700} size={"md"}>In order to use TradeTruth, please log in with Google.</Text>
                                <LoginButton/>
                            </Stack>
                        </Card>
                    </>}
                    {session?.user && <HomeTabs/>}
                </Stack>
            </Container>
        </>
    );
}
