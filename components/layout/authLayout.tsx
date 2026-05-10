import "../../styles/globals.css";
import AuthScreenHeader from "../shared/AuthScreenHeader";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={`flex flex-col mx-auto`}>
      <AuthScreenHeader />
      <section className="mx-auto flex items-center justify-center w-full mt-5 px-[4px]">
        {children}
      </section>
    </main>
  );
}
