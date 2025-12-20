import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { clsx } from "clsx";

export type StepStatus = "pending" | "active" | "completed" | "locked";

interface StepperProps {
  currentStep: number;
  steps: { id: string; label: string; status: StepStatus }[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="relative w-full py-8">
      {/* Connector Line */}
      <div className="absolute top-[2.75rem] left-0 w-full h-0.5 bg-white/10 -z-10" />
      <div 
        className="absolute top-[2.75rem] left-0 h-0.5 bg-primary transition-all duration-500 ease-out -z-10"
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />

      <div className="flex justify-between items-start w-full">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLocked = index > currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative group">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted 
                    ? "var(--color-primary)" 
                    : isActive 
                      ? "var(--color-background)" 
                      : "var(--color-background)",
                  borderColor: isCompleted 
                    ? "var(--color-primary)" 
                    : isActive 
                      ? "var(--color-primary)" 
                      : "var(--color-border)",
                }}
                className={clsx(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300",
                  isActive && "shadow-[0_0_15px_var(--color-primary)]"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-black" strokeWidth={3} />
                ) : isLocked ? (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <span className={clsx("font-display font-bold text-sm", isActive ? "text-primary" : "text-muted-foreground")}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
              
              <div className="absolute top-14 w-32 text-center">
                <span className={clsx(
                  "text-xs font-medium uppercase tracking-wider block transition-colors",
                  isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="active-dot" 
                    className="w-1 h-1 bg-primary rounded-full mx-auto mt-1" 
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
