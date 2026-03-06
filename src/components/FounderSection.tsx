import { motion } from "framer-motion";

const FounderSection = () => (
  <section id="about" className="relative z-10 py-24">
    <div className="container mx-auto px-6 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-8 sm:p-12 max-w-lg text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
          <span className="font-heading text-2xl font-bold text-primary">M</span>
        </div>

        <blockquote className="italic text-muted-foreground leading-relaxed mb-6">
          "I believe communication is a fundamental right — not a service that should depend on infrastructure, corporations, or connectivity. Mesh is built for the moments when everything else fails."
        </blockquote>

        <p className="font-heading font-semibold text-foreground">Yaakoubi Youssef</p>
        <p className="text-sm text-muted-foreground mt-1">Founder & Creator — Mesh</p>
      </motion.div>
    </div>
  </section>
);

export default FounderSection;
