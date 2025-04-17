export default function Footer() {
  return (
    <footer className="border-t bg-background w-full mt-auto px-5 md:px-20">
      <div className="mx-auto w-full py-4 ">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Dantour&lsquo;s. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
} 
