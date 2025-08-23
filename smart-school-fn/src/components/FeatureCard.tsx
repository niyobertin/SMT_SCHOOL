import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string
  description: string;
  index: number;
  fadeInUp: any; // You might want to properly type this based on your animation configuration
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
  fadeInUp,
}: FeatureCardProps) => {
  return (
    <motion.div
      className="text-center p-6 hover:shadow-lg transition-shadow rounded-xl"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={index}
    >
      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-[#1949d]" />
      </div>
      <h2 className="text-xl mb-2">{title}</h2>
      <p className="text-slate-600">{description}</p>
    </motion.div>
  );
};
