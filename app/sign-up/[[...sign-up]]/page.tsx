import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "rounded-lg shadow-lg",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700"
          }
        }}
      />
    </div>
  );
}