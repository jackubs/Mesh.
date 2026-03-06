import { motion } from "framer-motion";
import { Wifi, MessageSquare, Server, WifiOff } from "lucide-react";

const steps = [
  { icon: Wifi, title: "Direct Device Connection", desc: "Devices connect directly via Bluetooth or Wi-Fi Direct — no router needed." },
  { icon: MessageSquare, title: "Message Hopping", desc: "Messages relay through nearby devices to reach their destination across the mesh." },
  { icon: Server, title: "No Central Server", desc: "Fully decentralized. No single point of failure, no data collection." },
  { icon: WifiOff, title: "Works Offline", desc: "Operates without internet, cellular, or any existing infrastructure." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="relative z-10 py-24">
    <div className="container mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
        <div className="glow-line mx-auto w-48 mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass rounded-xl p-6 glow-border-hover"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold font-heading">{i + 1}</span>
              <s.icon size={22} className="text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
