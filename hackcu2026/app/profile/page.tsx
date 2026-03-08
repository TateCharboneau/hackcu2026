"use client";

import {Container, Title, Paper, Stack, Group, Avatar, Text, Divider, Card} from "@mantine/core";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { IconUser, IconMail, IconCalendar } from "@tabler/icons-react";


export default function ProfilePage() {
    const { data: session, status } = useSession();

    // Redirect to home if not authenticated
    if (status === "loading") {
        return null;
    }

    if (!session?.user) {
        redirect("/");
    }

    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                {/* Profile Header */}
                <Card shadow="sm" p="xl" radius="md">
                    <Group gap="lg">
                        <Avatar
                            src={session.user.image}
                            size={120}
                            radius="md"
                        />
                        <Stack gap="xs">
                            <Title order={2}>{session.user.name}</Title>
                            <Group gap="xs">
                                <IconMail size={18} />
                                <Text c="dimmed">{session.user.email}</Text>
                            </Group>
                        </Stack>
                    </Group>
                </Card>

                {/* Account Information */}
                <Card shadow="sm" p="xl" radius="md">
                    <Title order={3} mb="md">Account Information</Title>
                    <Stack gap="md">
                        <Group justify="apart">
                            <Group gap="xs">
                                <IconUser size={18} />
                                <Text fw={500}>Name</Text>
                            </Group>
                            <Text>{session.user.name}</Text>
                        </Group>
                        <Divider />
                        <Group justify="apart">
                            <Group gap="xs">
                                <IconMail size={18} />
                                <Text fw={500}>Email</Text>
                            </Group>
                            <Text>{session.user.email}</Text>
                        </Group>
                    </Stack>
                </Card>


            </Stack>
        </Container>
    );
}
