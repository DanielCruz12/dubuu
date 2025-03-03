"use client";

import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import { useTheme } from "next-themes";
import {
  Authenticator,
  Heading,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, usePathname } from "next/navigation";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
    },
  },
});

const components = {
  Header() {
    return (
      <View className="mt-4 mb-4">
        <Heading level={3} className="!text-2xl !font-bold">
          Dan
          <span className="text-secondary-500 font-light hover:!text-primary-300">
            Tours
          </span>
        </Heading>
        <p className="pt-2 text-sm text-muted-foreground">
          Explore new horizons with us, discovering beautiful and fascinating
          places on earth.
        </p>
      </View>
    );
  },
  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator();

      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground dark:text-white">
            Don&apos;t have an account?{" "}
            <button
              onClick={toSignUp}
              className="text-primary underline border-none p-0"
            >
              Sign Up Now
            </button>
          </p>
        </View>
      );
    },
  },
  SignUp: {
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Have an account?{" "}
            <button
              onClick={toSignIn}
              className="text-primary underline bg-transparent border-none p-0"
            >
              Sign In Now
            </button>
          </p>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
      label: "Email",
      isRequired: true,
    },
    password: {
      placeholder: "Enter your password",
      label: "Password",
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: "Create a password",
      label: "Password",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      isRequired: true,
    },
  },
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (isAuthPage) {
      setTheme("light");
    }
  }, [isAuthPage, setTheme]);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && isAuthPage) {
      router.replace("/");
    }
  }, [user, isAuthPage, router]);

  if (user && isAuthPage) {
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  // Allow access to public pages without authentication
  if (!isAuthPage && !isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen ">
      <Authenticator
        initialState={pathname.includes("signup") ? "signUp" : "signIn"}
        components={components}
        formFields={formFields}
      >
        {() => <>{children}</>}
      </Authenticator>
    </div>
  );
};

export default Auth;
