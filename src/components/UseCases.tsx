import { motion } from "framer-motion";
import { WifiOff, Mountain, Music, AlertTriangle } from "lucide-react";

const cases = [
  { icon: WifiOff, title: "Internet Outages", desc: "Keep communicating when ISPs go down or censorship hits." },
  { icon: Mountain, title: "Remote Areas", desc: "Stay connected in mountains, forests, and rural regions." },
  { icon: Music, title: "Festivals & Events", desc: "Coordinate with friends when cell towers are overloaded." },
  { icon: AlertTriangle, title: "Emergency Situations", desc: "Reliable communication during natural disasters and crises." },
];

const UseCases = () => (
  <section id="use-cases" className="relative z-10 py-24">
    <div className="container mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">Use Cases</h2>
        <div className="glow-line mx-auto w-48 mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {cases.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex items-start gap-4 glass rounded-xl p-6 glow-border-hover"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <c.icon size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default UseCases;
