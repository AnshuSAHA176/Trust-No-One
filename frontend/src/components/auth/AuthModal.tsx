import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { authService } from '../../services/auth';
import { soundEngine } from '../../audio/SoundEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Client-side validation
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsLoading(true);
    soundEngine.play('select');

    try {
      if (mode === 'register') {
        // Real register API: POST /register/
        await authService.register(email, password);
        // Automatically login with registered credentials
        await authService.login(email, password);
      } else {
        // Real login API: POST /login/
        await authService.login(email, password);
      }

      soundEngine.play('game_enter');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as {
        response?: {
          status?: number;
          data?: Record<string, string | string[]>;
        };
      };

      const data = errorObj.response?.data;
      if (data) {
        if (data.email) {
          setFieldErrors((prev) => ({
            ...prev,
            email: Array.isArray(data.email) ? data.email[0] : String(data.email),
          }));
        }
        if (data.password) {
          setFieldErrors((prev) => ({
            ...prev,
            password: Array.isArray(data.password) ? data.password[0] : String(data.password),
          }));
        }
        if (data.non_field_errors) {
          setGeneralError(
            Array.isArray(data.non_field_errors)
              ? data.non_field_errors[0]
              : String(data.non_field_errors)
          );
        } else if (!data.email && !data.password) {
          setGeneralError(
            typeof data === 'string'
              ? data
              : 'Authentication failed. Please verify your credentials.'
          );
        }
      } else {
        setGeneralError('Unable to connect to the authentication server. Please verify backend is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-noir-900 border border-ivory-200/15 rounded-xl p-6 sm:p-8 shadow-noir-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ivory-200/10 mb-6">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-crimson-glow" />
            <span className="font-intel text-xs text-ivory-300 tracking-widest uppercase">
              SPECIAL BRANCH ACCESS GATEWAY
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-ivory-400 hover:text-ivory-100 p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: LOGIN vs REGISTER */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-noir-950 rounded-lg border border-ivory-200/10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setGeneralError(null);
              setFieldErrors({});
            }}
            className={`py-2 text-xs font-intel font-bold tracking-wider rounded transition-all ${
              mode === 'login'
                ? 'bg-noir-800 text-ivory-100 border border-ivory-200/20 shadow-sm'
                : 'text-ivory-400 hover:text-ivory-200'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setGeneralError(null);
              setFieldErrors({});
            }}
            className={`py-2 text-xs font-intel font-bold tracking-wider rounded transition-all ${
              mode === 'register'
                ? 'bg-noir-800 text-ivory-100 border border-ivory-200/20 shadow-sm'
                : 'text-ivory-400 hover:text-ivory-200'
            }`}
          >
            REGISTER
          </button>
        </div>

        <div className="mb-6">
          <h2 className="font-cinematic text-2xl font-bold text-ivory-100 mb-1">
            {mode === 'login' ? 'VERIFY IDENTITY' : 'CREATE CREDENTIALS'}
          </h2>
          <p className="text-xs text-ivory-300 font-light">
            {mode === 'login'
              ? 'Enter your registered credentials to access active investigation chambers.'
              : 'Register an investigator account with password minimum 8 characters.'}
          </p>
        </div>

        {generalError && (
          <div className="p-3 mb-6 bg-crimson/15 border border-crimson/40 rounded text-xs text-crimson-glow flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-[10px] font-intel text-ivory-400 uppercase tracking-widest mb-1.5">
              OFFICIAL EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ivory-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@agency.gov"
                className="w-full pl-10 pr-4 py-2.5 bg-noir-800 border border-ivory-200/20 rounded font-sans text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson text-xs sm:text-sm"
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] text-crimson-glow font-sans">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[10px] font-intel text-ivory-400 uppercase tracking-widest mb-1.5">
              SECURITY PASSPHRASE (MIN. 8 CHARACTERS)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-ivory-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-noir-800 border border-ivory-200/20 rounded font-sans text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson text-xs sm:text-sm"
                required
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] text-crimson-glow font-sans">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-crimson hover:bg-crimson-accent disabled:opacity-50 text-ivory-50 font-cinematic font-bold tracking-widest text-xs rounded transition-all shadow-crimson-glow flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{mode === 'login' ? 'SIGN IN' : 'REGISTER & COMMENCE'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
