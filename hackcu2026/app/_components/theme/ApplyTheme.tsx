// "use client";
// import { useEffect } from "react";
// // import { useUser } from "@/lib/swr";
// import { useMantineColorScheme } from "@mantine/core";
//
// export default function ApplyTheme() {
//     const { colorScheme, setColorScheme } = useMantineColorScheme();
//     const { user, isLoading, isError } = useUser();
//
//     useEffect(() => {
//         if (isLoading || isError || !user) return;
//         const desired = (user.theme ?? "light") as "light" | "dark" | "auto";
//         if (colorScheme !== desired) setColorScheme(desired);
//     }, [isLoading, isError, user?.theme]);
//
//     return <></>;
// }
