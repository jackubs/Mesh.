const MeshFooter = () => (
  <footer className="relative z-10 border-t border-border py-8">
    <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <span className="font-heading font-bold text-foreground">
        Mesh<span className="text-primary">.</span>
      </span>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <a href="#about" className="hover:text-primary transition-colors">About</a>
        <a href="#" className="hover:text-primary transition-colors">Contact</a>
        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
        <a href="#" className="hover:text-primary transition-colors">GitHub</a>
      </div>
      <p className="text-xs text-muted-foreground">© 2026 Mesh. All rights reserved.</p>
    </div>
  </footer>
);

export default MeshFooter;
