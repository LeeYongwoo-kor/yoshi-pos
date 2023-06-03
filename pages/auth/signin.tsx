import useError from "@/hooks/context/useError";
import useToast from "@/hooks/context/useToast";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { authOptions } from "../api/auth/[...nextauth]";
import useToastError from "@/hooks/context/useToastError";

type SigninProps = {
  callbackError: string;
};
interface IEmail {
  email: string;
}

const callbackErrors: { [key: string]: string } = {
  Signin: "Try signing with a different account.",
  OAuthSignin: "Try signing with a different account.",
  OAuthCallback: "Try signing with a different account.",
  OAuthCreateAccount: "Try signing with a different account.",
  EmailCreateAccount: "Try signing with a different account.",
  Callback: "Try signing with a different account.",
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "Check your email address.",
  CredentialsSignin:
    "Sign in failed. Check the details you provided are correct.",
  default: "Unable to sign in.",
};

const expectedErrors: { [key: string]: string } = {
  "email-already-in-use":
    "The email is already in use. Please use a different email.",
  "prisma-error": "The signin process failed. Please try again later.",
  // new custom errors
  RefreshAccessTokenError:
    "Unable to refresh access token, Please sign in again.",
  Unauthorized: "Unauthorized access, Please sign in again.",
  UnsupportedProviderError: "Unsupported provider, Please sign in again.",
  UpdateUserError: "Unable to update your account, Please try again.",
  NotAllowedAccess: "You are not allowed to access that page. Please sign in.",
  InvalidError: "Invalid Error Occured, Please try again.",
};

function getExpctedError(errorName: string): string | undefined {
  return expectedErrors[errorName];
}

const Signin = ({ callbackError }: SigninProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error } = useError();
  const toastError = useToastError();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IEmail>();

  const errorName = error?.errorName;
  const errorMessage = error?.errorMessage;

  const onValid = async ({ email }: IEmail) => {
    setIsSubmitting(true);
    await signIn("email", { email, callbackUrl: "/dashboard" });
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (errorName) {
      toastError(
        getExpctedError(errorName) ||
          errorMessage ||
          "Unexpected Error Occured. Please try again."
      );
    }
  }, [errorName, errorMessage, toastError]);

  return (
    <main>
      <Head>
        <title>Yoshi-POS | Login</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded shadow">
          <div className="mb-1 text-center">
            <Image
              width={100}
              height={100}
              className="mx-auto w-44 h-44"
              src="/logo/yoshi.jpg"
              alt="Yoshi Logo"
            />
          </div>
          <form onSubmit={handleSubmit(onValid)}>
            <div className="mb-4">
              <label className="block mb-2 font-bold text-gray-700">
                Email
              </label>
              <input
                disabled={isSubmitting}
                {...register("email", {
                  required: "Write your email please",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                placeholder="Please input email address"
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              {callbackError && (
                <p className="mt-1 text-xs text-red-500">
                  Error: {callbackError}
                </p>
              )}
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
              {/* {signinError && (
                <p className="mt-1 text-xs text-red-500">
                  Error: {signinErrors[signinError]}
                </p>
              )} */}
            </div>
            <button
              disabled={isSubmitting}
              type="submit"
              className={`w-full px-4 py-2 font-bold text-white bg-blue-500 rounded focus:outline-none focus:bg-blue-600 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Email Login
            </button>
          </form>
          <div className="mt-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded"
            >
              <Image
                width={50}
                height={50}
                className="w-5 h-5 mr-2"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
              />
              Sign in with Google
            </button>
          </div>
          <div className="mt-2">
            <button
              onClick={() => signIn("line", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded"
            >
              <Image
                width={50}
                height={50}
                className="w-5 h-5 mr-2"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/1920px-LINE_logo.svg.png"
                alt="Line logo"
              />
              Sign in with Line
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signin;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
      },
    };
  }

  const { error } = ctx.query;
  if (error) {
    return {
      props: {
        callbackError:
          callbackErrors[error as string] ?? callbackErrors.default,
      },
    };
  }

  return { props: {} };
}
