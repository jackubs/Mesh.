import { motion } from "framer-motion";
import { MessageCircle, Network, Shield, Siren, Zap } from "lucide-react";

const features = [
  { icon: MessageCircle, title: "Offline Messaging", desc: "Send and receive messages with zero internet connectivity." },
  { icon: Network, title: "Decentralized Network", desc: "No servers, no cloud — your network belongs to its users." },
  { icon: Shield, title: "Secure Communication", desc: "End-to-end encrypted messages that stay between devices." },
  { icon: Siren, title: "Emergency Communication", desc: "Stay connected during disasters when infrastructure fails." },
  { icon: Zap, title: "Lightweight & Fast", desc: "Minimal resource usage. Works on low-end devices." },
];

const Features = () => (
  <section id="features" className="relative z-10 py-24">
    <div className="container mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">Key Features</h2>
        <div className="glow-line mx-auto w-48 mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="glass rounded-xl p-6 glow-border-hover"
          >
            <f.icon size={28} className="text-primary mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
