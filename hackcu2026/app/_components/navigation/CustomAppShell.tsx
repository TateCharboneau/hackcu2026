"use client";
import {
    ActionIcon,
    AppShell, Avatar,
    Box,
    Burger,
    Button,
    Group, Loader, Menu, MenuDivider, MenuDropdown, MenuItem, MenuTarget,
    NativeSelect, Overlay, Skeleton,
    Title, useComputedColorScheme,
    useMantineColorScheme
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import Link from "next/link";
import {redirect, usePathname} from "next/navigation";
import {useState} from "react";
import styles from "./header.module.css";
import Image from "next/image";
import {bitcount, orbitron} from "@/app/fonts";
import {IconDashboard, IconLogout, IconMoon, IconSun, IconUser} from "@tabler/icons-react";
import LoginButton from "@/app/_components/auth/loginButton/LoginButton";
import {signOut, useSession} from "next-auth/react";
import {notifications} from "@mantine/notifications";
import LoadingOverlay from "@/app/_components/home/loading/LoadingOverlay";

interface Props {
    children: React.ReactNode;
}

export default function CustomAppShell(props: Props) {
    const {children, ...rest} = props;

    const [opened, {toggle}] = useDisclosure();

    const {data: session, update, status} = useSession();

    // console.log(session);


    const pathname = usePathname();
    const splitPath: string[] = pathname ? pathname.split("/") : ["/"];
    const [active, setActive] = useState(pathname ? pathname == "/" ? "/" : splitPath[splitPath.length - 1] : "/");

    const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false);

    const {toggleColorScheme, setColorScheme} = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', {getInitialValueInEffect: true});

    const navLinks = [
        // {label: 'About Us', href: '/about'},
        {label: 'Home', href: '/'},
        {label: 'About', href: '/about'},
    ];

    return (<>
        <AppShell
            padding="md"
            header={{height: 60}}
            // navbar={{
            //     width: 300,
            //     breakpoint: 'sm',
            //     collapsed: {mobile: !opened},
            // }}
        >
            <AppShell.Header>
                <Group p={10} h={60} align="center">
                    {/*<Burger*/}
                    {/*    className={styles.navbarBurger}*/}
                    {/*    opened={opened}*/}
                    {/*    onClick={toggle}*/}
                    {/*    hiddenFrom="sm"*/}
                    {/*    size="sm"*/}
                    {/*/>*/}
                    <Title className={bitcount.className} order={1} mr={5} visibleFrom={"xs"}>TradeTruth</Title>
                    <Title className={bitcount.className} order={1} mr={5} hiddenFrom={"xs"}>TT</Title>

                    <Group className={styles.accountButtonsGroup} visibleFrom="md">
                        {navLinks.map((link) =>
                            <Link key={link.label} href={link.href}>
                                <Button variant="outline" color="gray">
                                    {link.label}
                                </Button>
                            </Link>
                        )}
                    </Group>
                    <Group className={styles.accountButtonsGroup} hiddenFrom="md">
                        <NativeSelect classNames={{wrapper: styles.dropdownNavigationWrapper}}
                                      data={["Home", ...navLinks.map((link) => link.label)]}
                                      aria-label="Navigation Dropdown"
                                      defaultValue={navLinks.find((link) => link.href.slice(1).includes(active)) ? navLinks.find((link) => link.href.slice(1).includes(active))?.label : "Home"}
                                      color="gray"
                                      onChange={(event) => {
                                          const selectedLabel = event.currentTarget.value;
                                          let selectedLink;
                                          if (selectedLabel == "Home") selectedLink = "/";
                                          else selectedLink = navLinks.find(link => link.label === selectedLabel)?.href;
                                          if (!selectedLink) selectedLink = "/";
                                          redirect(selectedLink);
                                      }}
                        />
                    </Group>

                    <Group ml={"auto"} gap={15}>
                        {status === "loading" && <Skeleton w={200} h={40}/>}
                        {!session?.user && status !== "loading" && <LoginButton/>}
                        {session?.user && <>
                            <Menu shadow="md" width={200}>
                                <MenuTarget>
                                    <div className={styles.accountButtonsGroup} style={{cursor: "pointer"}}
                                        //hiddenFrom="sm"
                                    >
                                        <Avatar src={session.user.image}/>
                                    </div>
                                </MenuTarget>

                                <MenuDropdown>
                                    <Menu.Label>Account</Menu.Label>
                                    <MenuItem leftSection={<IconUser size={14}/>} component={Link} href="/profile">
                                        Profile
                                    </MenuItem>
                                    <MenuDivider/>
                                    <MenuItem leftSection={<IconLogout size={14}/>} onClick={async () => {
                                        setLoadingOverlayVisible(true);
                                        await signOut();
                                        setLoadingOverlayVisible(false);
                                        notifications.show({
                                            position: 'top-center',
                                            withCloseButton: true,
                                            message: 'You\'ve been logged out',
                                        });
                                    }}>
                                        Logout
                                    </MenuItem>
                                </MenuDropdown>
                            </Menu>
                        </>}
                        <ActionIcon
                            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                            variant="default"
                            size="xl"
                            aria-label="Toggle color scheme"
                        >
                            <Box lightHidden>
                                <IconSun stroke={1.5}/>
                            </Box>
                            <Box darkHidden>
                                <IconMoon stroke={1.5}/>
                            </Box>
                        </ActionIcon>
                        {loadingOverlayVisible && <LoadingOverlay/>}
                    </Group>

                </Group>
            </AppShell.Header>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    </>);

}

