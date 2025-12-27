export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center items-center p-6 bg-background">
      {children}
    </div>
  );
}
