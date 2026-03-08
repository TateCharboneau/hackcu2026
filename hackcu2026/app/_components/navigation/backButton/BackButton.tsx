"use client";
import {Button} from "@mantine/core";
import { IconArrowBack } from "@tabler/icons-react";
import {useRouter} from "next/navigation";

export default function BackButton(props: any) {
    //ts-expect-error don't worry about ittttt
    const {...rest} = props;
    const router = useRouter();

    return (<>
        <Button onClick={router.back} {...rest} variant={"outline"}><IconArrowBack/> Back</Button>
    </>);
}

