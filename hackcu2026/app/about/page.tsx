"use client";
import {
    Title,
    Text,
    Container,
    Stack,
    Card,
    Group,
    Avatar,
    Badge,
    SimpleGrid,
    List,
    ThemeIcon,
    Paper,
    Divider
} from "@mantine/core";
import {
    IconShieldCheck,
    IconBrandGithub,
    IconMail,
    IconCode,
    IconBrain,
    IconChartLine
} from "@tabler/icons-react";

// Contributor data - Update with your team information
const contributors = [
    {
        name: "Dresden Friar",
        role: "Full Stack Developer",
        avatar: "https://media.licdn.com/dms/image/v2/D5603AQGdilTYhSqtCg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1725236058723?e=1774483200&v=beta&t=Lsvis4WzLEYDLuz7OSkqBxMvZM1YioGemwbXvda3rkg", // Add image URL or leave empty for initials
        bio: "Passionate about building secure financial tools that protect investors from fraud and market manipulation.",
        github: "Dresden6",
        email: "contributor1@example.com"
    },
    {
        name: "Matvey Bubalo",
        role: "Front End Developer",
        avatar: "https://media.licdn.com/dms/image/v2/D4E03AQExQYgIhwP2Vw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1725155701085?e=1774483200&v=beta&t=yN8Gv6btxwjX5Gupt60970CHsDMzwrVzB1ESrt0yw0c",
        bio: "Focused on creating a welcoming user experience and seamless integration with the backend",
        github: "MatveyBu",
        email: "contributor2@example.com"
    },
    {
        name: "Tate Charboneau",
        role: "Backend Developer",
        avatar: "https://media.licdn.com/dms/image/v2/D5603AQHnBDlXDoyrdw/profile-displayphoto-shrink_400_400/B56ZOem6LDG8Ag-/0/1733532820439?e=1774483200&v=beta&t=dkSTIs1cRF5-wWeSbJTYnFn-HSOZlU_Nbqk9hlf65w4",
        bio: "Focused on creating scalable and secure systems.",
        github: "TateCharboneau",
        email: "contributor3@example.com"
    },
    {
        name: "Gavin Wilson",
        role: "Database Engineer",
        avatar: "https://hips.hearstapps.com/hmg-prod/images/heath_ledger_getty_images_photo_bob_riha_jr_wireimage_116948085.jpg",
        bio: "Architect of robust database systems optimized for storing and querying large-scale financial datasets.",
        github: "Gawlson",
        email: "contributor4@example.com"
    }
];

const techStack = [
    "Next.js & React",
    "TypeScript",
    "Mantine UI",
    "Next-Auth",
    "MongoDB & Mongoose",
    "AI/ML Analysis",
    "Web Scraping & Transcription"
];

export default function About() {
    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <div>
                    <Title order={1} mb="md">About TradeTruth</Title>
                    <Text size="xl" c="dimmed">
                        Empowering investors with AI-powered financial advice verification
                    </Text>
                </div>

                <Divider />

                {/* Mission Statement */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                        <Group>
                            <ThemeIcon size="xl" radius="md" variant="light">
                                <IconShieldCheck size={28} />
                            </ThemeIcon>
                            <Title order={2}>Our Mission</Title>
                        </Group>
                        <Text size="md">
                            Today's financial landscape is increasingly defined by a struggle between honest investors
                            and those who use their authority to manipulate markets for personal gain. TradeTruth is
                            an AI-powered platform designed to help users critically evaluate financial advice before
                            accepting it as credible.
                        </Text>
                        <Text size="md">
                            By simply providing a link to a video or post recommending a purchase, our system analyzes
                            the content and assesses whether the advice can reasonably be considered sound. We serve as
                            an additional layer of protection against malicious traders, bad-faith influencers, and
                            crypto scam artists who attempt to profit at the expense of unsuspecting individuals.
                        </Text>
                    </Stack>
                </Card>

                {/* How It Works */}
                <div>
                    <Title order={2} mb="md">How It Works</Title>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Stack gap="md" align="center">
                                <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                                    <IconBrain size={28} />
                                </ThemeIcon>
                                <Title order={3} ta="center">AI Analysis</Title>
                                <Text size="sm" ta="center">
                                    Our AI analyzes financial content from videos and posts, extracting key
                                    recommendations and claims.
                                </Text>
                            </Stack>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Stack gap="md" align="center">
                                <ThemeIcon size="xl" radius="md" variant="light" color="green">
                                    <IconChartLine size={28} />
                                </ThemeIcon>
                                <Title order={3} ta="center">Market Simulation</Title>
                                <Text size="sm" ta="center">
                                    We simulate the recommended trades against historical market data to evaluate
                                    their actual performance.
                                </Text>
                            </Stack>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Stack gap="md" align="center">
                                <ThemeIcon size="xl" radius="md" variant="light" color="orange">
                                    <IconShieldCheck size={28} />
                                </ThemeIcon>
                                <Title order={3} ta="center">Risk Assessment</Title>
                                <Text size="sm" ta="center">
                                    We provide transparency and red flag detection to help you make informed
                                    investment decisions.
                                </Text>
                            </Stack>
                        </Card>
                    </SimpleGrid>
                </div>

                <Divider />

                {/* Contributors */}
                <div>
                    <Title order={2} mb="md">Our Team</Title>
                    <Text size="md" c="dimmed" mb="lg">
                        Built by passionate developers during HackCU 2026
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                        {contributors.map((contributor, index) => (
                            <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
                                <Group wrap="nowrap" align="flex-start">
                                    <Avatar
                                        src={contributor.avatar}
                                        size="lg"
                                        radius="md"
                                        alt={contributor.name}
                                    >
                                        {contributor.name.split(' ').map(n => n[0]).join('')}
                                    </Avatar>
                                    <Stack gap="xs" style={{ flex: 1 }}>
                                        <div>
                                            <Title order={4}>{contributor.name}</Title>
                                            <Badge variant="light" size="sm">
                                                {contributor.role}
                                            </Badge>
                                        </div>
                                        <Text size="sm" c="dimmed">
                                            {contributor.bio}
                                        </Text>
                                        <Group gap="xs">
                                            {contributor.github && (
                                                <a
                                                    href={`https://github.com/${contributor.github}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'inherit' }}
                                                >
                                                    <Group gap={4}>
                                                        <IconBrandGithub size={16} />
                                                        <Text size="xs">{contributor.github}</Text>
                                                    </Group>
                                                </a>
                                            )}
                                        </Group>
                                    </Stack>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                </div>

                <Divider />

                {/* Tech Stack */}
                <div>
                    <Title order={2} mb="md">Technology Stack</Title>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group>
                            <ThemeIcon size="xl" radius="md" variant="light" color="violet">
                                <IconCode size={28} />
                            </ThemeIcon>
                            <div style={{ flex: 1 }}>
                                <List spacing="xs">
                                    {techStack.map((tech, index) => (
                                        <List.Item key={index}>
                                            <Text size="md">{tech}</Text>
                                        </List.Item>
                                    ))}
                                </List>
                            </div>
                        </Group>
                    </Card>
                </div>

                {/* Footer/CTA */}
                <Paper p="lg" radius="md" withBorder>
                    <Stack gap="md" align="center">
                        <Title order={3}>Get Involved</Title>
                        <Text size="md" ta="center">
                            TradeTruth is an open-source project. We welcome contributions, feedback, and suggestions
                            from the community.
                        </Text>
                        <Group>
                            <a
                                href="https://github.com/Dresden6/HackCU2026"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                <Badge
                                    size="lg"
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                                    leftSection={<IconBrandGithub size={16} />}
                                    style={{ cursor: 'pointer' }}
                                >
                                    View on GitHub
                                </Badge>
                            </a>
                        </Group>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}

