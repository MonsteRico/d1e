"use client"
import React from 'react'
import { Button } from './ui/button';
import { authClient } from '@/lib/auth-client';

function SignInButton() {
  return (
    <Button
      onClick={async () => {
        const data = await authClient.signIn.social({ provider: "discord" });
        console.log(data);
      }}
    >
      Sign In With Discord
    </Button>
  );
}

export default SignInButton