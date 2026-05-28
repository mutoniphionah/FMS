import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* ── tiny reusable pieces ─────────────────────────────────── */

function IconUser() {
  return (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function EyeOpen() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* password strength meter */
function strengthInfo(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)                    score++;
  if (/[A-Z]/.test(pw))                  score++;
  if (/[a-z]/.test(pw))                  score++;
  if (/\d/.test(pw))                     score++;
  if (/[@$!%*?&_#]/.test(pw))            score++;
  const map = [
    { label: '',          color: '' },
    { label: 'Very weak', color: 'bg-red-500' },
    { label: 'Weak',      color: 'bg-orange-400' },
    { label: 'Fair',      color: 'bg-yellow-400' },
    { label: 'Good',      color: 'bg-blue-500' },
    { label: 'Strong',    color: 'bg-emerald-500' },
  ];
  return { score, ...map[score] };
}

/* shared input wrapper */
function InputField({ label, name, type = 'text', value, onChange, placeholder, icon, right, required = true }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm text-slate-800
                     placeholder-slate-400 bg-slate-50 focus:bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-150"
        />
        {right && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── main component ───────────────────────────────────────── */
export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  // tab: 'login' | 'register'
  const [tab, setTab] = useState('login');

  /* login state */
  const [loginForm, setLoginForm]   = useState({ username: '', password: '' });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  /* register state */
  const [regForm, setRegForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [showRegPw, setShowRegPw]   = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [regError, setRegError]     = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const strength = strengthInfo(regForm.password);

  /* ── handlers ── */
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setLoginError('');
  };

  const handleRegChange = (e) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
    setRegError('');
    setRegSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await login(loginForm.username, loginForm.password);
      navigate('/vehicles');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    setRegSuccess('');
    try {
      const res = await api.post('/auth/register', regForm);
      setRegSuccess(res.data.message);
      setRegForm({ username: '', password: '', confirmPassword: '' });
      // switch to login after short delay
      setTimeout(() => { setTab('login'); setRegSuccess(''); }, 2200);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setRegLoading(false);
    }
  };

  /* ── left panel (shared) ── */
  const LeftPanel = () => (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12
                    bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900
                    relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 opacity-20 rounded-full" />
      <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-blue-500 opacity-10 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-wide">SwiftWheels</span>
        </div>

        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
          Fleet Management<br />
          <span className="text-blue-300">Made Simple</span>
        </h1>
        <p className="text-blue-200 text-base leading-relaxed max-w-sm">
          Track vehicles, record trips, manage maintenance — all in one place for SwiftWheels operations in Huye District.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-4">
        {[{ label: 'Vehicles', icon: '🚌' }, { label: 'Trips', icon: '🗺️' }, { label: 'Maintenance', icon: '🔧' }].map((s) => (
          <div key={s.label}
            className="bg-white bg-opacity-10 rounded-xl p-4 text-center backdrop-blur-sm border border-white border-opacity-10">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-white text-xs font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── tab button ── */
  const TabBtn = ({ id, label, icon }) => (
    <button
      type="button"
      onClick={() => { setTab(id); setLoginError(''); setRegError(''); setRegSuccess(''); }}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
        tab === id
          ? 'bg-white text-blue-700 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  /* ── render ── */
  return (
    <div className="min-h-screen flex bg-slate-900">
      <LeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-slate-800 font-bold text-xl">SwiftWheels FMS</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

            {/* ── Tab switcher ── */}
            <div className="bg-slate-100 p-1.5 m-5 mb-0 rounded-xl flex gap-1">
              <TabBtn
                id="login"
                label="Sign In"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                }
              />
              <TabBtn
                id="register"
                label="Register"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                }
              />
            </div>

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <div className="p-7 pt-5">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Welcome back</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Sign in to your fleet management account</p>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700
                                  rounded-xl px-4 py-3 mb-5 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField
                    label="Username"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    placeholder="Enter your username"
                    icon={<IconUser />}
                  />
                  <InputField
                    label="Password"
                    name="password"
                    type={showLoginPw ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    icon={<IconLock />}
                    right={
                      <button type="button" onClick={() => setShowLoginPw(!showLoginPw)}
                        className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle password">
                        {showLoginPw ? <EyeOff /> : <EyeOpen />}
                      </button>
                    }
                  />

                  <button type="submit" disabled={loginLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300
                               text-white font-semibold py-3 rounded-xl transition-all duration-200
                               flex items-center justify-center gap-2 shadow-md shadow-blue-100 mt-1">
                    {loginLoading
                      ? <><Spinner /> Signing in…</>
                      : <>Sign In <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                    }
                  </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-5">
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => setTab('register')}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2">
                    Create one
                  </button>
                </p>
              </div>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <div className="p-7 pt-5">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Create account</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Register a new fleet management account</p>
                </div>

                {/* Error */}
                {regError && (
                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700
                                  rounded-xl px-4 py-3 mb-5 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {regError}
                  </div>
                )}

                {/* Success */}
                {regSuccess && (
                  <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700
                                  rounded-xl px-4 py-3 mb-5 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {regSuccess} Redirecting to sign in…
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Username */}
                  <InputField
                    label="Username"
                    name="username"
                    value={regForm.username}
                    onChange={handleRegChange}
                    placeholder="Choose a username (min 3 chars)"
                    icon={<IconUser />}
                  />

                  {/* Password */}
                  <div>
                    <InputField
                      label="Password"
                      name="password"
                      type={showRegPw ? 'text' : 'password'}
                      value={regForm.password}
                      onChange={handleRegChange}
                      placeholder="Create a strong password"
                      icon={<IconLock />}
                      right={
                        <button type="button" onClick={() => setShowRegPw(!showRegPw)}
                          className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle password">
                          {showRegPw ? <EyeOff /> : <EyeOpen />}
                        </button>
                      }
                    />

                    {/* Strength meter */}
                    {regForm.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                n <= strength.score ? strength.color : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${
                          strength.score <= 2 ? 'text-red-500' :
                          strength.score === 3 ? 'text-yellow-600' :
                          strength.score === 4 ? 'text-blue-600' : 'text-emerald-600'
                        }`}>
                          {strength.label}
                          {strength.score < 5 && (
                            <span className="text-slate-400 font-normal ml-1">
                              — use uppercase, lowercase, number &amp; special char
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <InputField
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfPw ? 'text' : 'password'}
                      value={regForm.confirmPassword}
                      onChange={handleRegChange}
                      placeholder="Re-enter your password"
                      icon={<IconLock />}
                      right={
                        <button type="button" onClick={() => setShowConfPw(!showConfPw)}
                          className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle confirm password">
                          {showConfPw ? <EyeOff /> : <EyeOpen />}
                        </button>
                      }
                    />
                    {/* Match indicator */}
                    {regForm.confirmPassword && (
                      <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${
                        regForm.password === regForm.confirmPassword ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {regForm.password === regForm.confirmPassword
                          ? <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Passwords match</>
                          : <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg> Passwords do not match</>
                        }
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={regLoading || !!regSuccess}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                               disabled:bg-emerald-300 text-white font-semibold py-3 rounded-xl
                               transition-all duration-200 flex items-center justify-center gap-2
                               shadow-md shadow-emerald-100 mt-1">
                    {regLoading
                      ? <><Spinner /> Creating account…</>
                      : <>
                          Create Account
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </>
                    }
                  </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-5">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setTab('login')}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2">
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            &copy; 2026 SwiftWheels &mdash; Huye District, Southern Province, Rwanda
          </p>
        </div>
      </div>
    </div>
  );
}
