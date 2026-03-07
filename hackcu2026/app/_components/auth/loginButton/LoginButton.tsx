import {Button} from "@mantine/core";
import {signIn} from "next-auth/react";

export default function LoginButton() {
    return (
        <>
            <form
                action={async () => {
                    await signIn("google")
                }}
            >
                <Button type="submit">Signin with Google</Button>
            </form>
        </>
    );
}

