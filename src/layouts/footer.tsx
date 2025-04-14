export default function Footer() {
  return (
    <footer className="border-t bg-background text-center px-3 md:px-0">
      <div className="max-w-7xl mx-auto w-full flex md:flex-col h-16 items-center justify-between">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Dantour&lsquo;s. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
