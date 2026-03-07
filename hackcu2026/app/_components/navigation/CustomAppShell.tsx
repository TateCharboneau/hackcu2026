"use client";
import {AppShell, Box, Burger, Button, Group, NativeSelect, Title} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import Link from "next/link";
import {redirect, usePathname} from "next/navigation";
import {useState} from "react";
import styles from "./header.module.css";
import Image from "next/image";
import {bitcount, orbitron} from "@/app/fonts";

interface Props {
    children: React.ReactNode;
}

export default function CustomAppShell(props: Props) {
    const {children, ...rest} = props;

    const [opened, {toggle}] = useDisclosure();

    const pathname = usePathname();
    const splitPath: string[] = pathname ? pathname.split("/") : ["/"];
    const [active, setActive] = useState(pathname ? pathname == "/" ? "/" : splitPath[splitPath.length - 1] : "/");

    const navLinks = [
        // {label: 'About Us', href: '/about'},
        {label: 'Home', href: '/'},
        {label: 'About', href: '/about'},
    ];

    return (<>
        <AppShell
            padding="md"
            header={{height: 60}}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: {mobile: !opened},
            }}
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
                    <Title className={bitcount.className} order={1} mr={10}>TradeTruth</Title>

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
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    </>);

}

