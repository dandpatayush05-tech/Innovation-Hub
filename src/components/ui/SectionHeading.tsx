import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from './Button';

interface SectionHeadingProps extends HTMLMotionProps<"div"> {
  preTitle?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ 
  preTitle, 
  title, 
  subtitle, 
  align = 'left',
  className,
  ...props
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex flex-col gap-3",
        align === 'center' && "items-center text-center",
        className
      )}
      {...props}
    >
      {preTitle && (
        <span className="text-primary font-semibold tracking-wider uppercase text-sm">
          {preTitle}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-2xl mt-2">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
