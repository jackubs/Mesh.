import { motion } from "framer-motion";
import { Smartphone, Download } from "lucide-react";

const DownloadSection = () => (
  <section id="download" className="relative z-10 py-24">
    <div className="container mx-auto px-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <Smartphone size={48} className="text-primary mx-auto mb-6" />
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gradient mb-4">Join the Network</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Download Mesh and start communicating — no internet required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/app-debug.apk" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            <Download size={18} />
            Download for Android
          </a>
          <button disabled className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-8 py-3 font-medium text-muted-foreground cursor-not-allowed opacity-50">
            iOS — Coming Soon
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default DownloadSection;
