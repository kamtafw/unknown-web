import "../../styles/globals.css";
import AuthScreenHeader from "../shared/AuthScreenHeader";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={`flex flex-col min-h-screen mx-auto`}>
      <AuthScreenHeader />
      <section className="mx-auto flex items-center justify-center w-full flex-1 px-[24px]">
        {children}
      </section>
    </main>
  );
}
