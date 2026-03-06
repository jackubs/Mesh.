import { motion } from "framer-motion";
import { ChevronDown, Download } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
    <div className="container mx-auto px-6 text-center relative z-10">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center gap-6">
        <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground glass">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Beta — Now Available
        </motion.div>

        <motion.h1 variants={item} className="font-heading text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-gradient">
          Mesh
        </motion.h1>

        <motion.p variants={item} className="font-heading text-xl sm:text-2xl md:text-3xl font-medium text-foreground">
          Communication Without Internet.
        </motion.p>

        <motion.p variants={item} className="max-w-xl text-muted-foreground leading-relaxed">
          A peer-to-peer offline messaging app that connects devices directly — no Wi-Fi, no cell towers, no servers. Just you and your network.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mt-4">
          <a href="#download" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            <Download size={18} />
            Download App
          </a>
          <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-foreground hover:border-primary/50 transition-colors">
            Learn More
          </a>
        </motion.div>

        <motion.div variants={item} className="mt-12">
          <ChevronDown size={28} className="text-muted-foreground animate-bounce-slow" />
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
