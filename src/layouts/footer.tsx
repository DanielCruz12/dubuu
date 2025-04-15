export default function Footer() {
  return (
    <footer className="border-t bg-background w-full mt-auto">
      <div className="max-w-7xl mx-auto w-full py-4 px-3 md:px-6">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Dantour&lsquo;s. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
