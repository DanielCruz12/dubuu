export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto w-full flex h-16 items-center justify-between">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} My Website. All rights reserved.
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
