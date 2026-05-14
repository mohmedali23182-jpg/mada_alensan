import Header from "./Header";
import Footer from "./Footer";

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <>
      <Header />
      <main className="pt-[112px] min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
