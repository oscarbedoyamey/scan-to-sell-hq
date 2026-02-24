import zignoLogo from '@/assets/zigno-logo.png';

interface ActivationLayoutProps {
  children: React.ReactNode;
  step?: 1 | 2 | 3;
}

const stepLabels = ['Activa', 'Regístrate', 'Publica'];

export const ActivationLayout = ({ children, step }: ActivationLayoutProps) => (
  <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
    {/* Logo */}
    <img src={zignoLogo} alt="Zigno" className="h-8 w-auto mb-6" />

    {/* Step indicator */}
    {step && (
      <div className="flex items-center gap-0 mb-8 w-full max-w-xs">
        {stepLabels.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === step;
          const isDone = stepNum < step;
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isDone
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isDone ? '✓' : stepNum}
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={`h-0.5 w-full mt-[-12px] ${
                    isDone ? 'bg-primary/30' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* Content */}
    <div className="w-full max-w-md flex-1 flex flex-col">{children}</div>
  </div>
);
