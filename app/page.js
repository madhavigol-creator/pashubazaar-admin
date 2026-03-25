'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { seedInitialData } from '../lib/firestore';

// ═══════ LOGIN SCREEN ═══════
function LoginScreen() {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErr(''); setLoading(true);
    try {
      if (tab === 'login') await login(email, pass);
      else await signup(email, pass);
    } catch (e) {
      setErr(e.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, ''));
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0F2918 0%, #1B5E20 40%, #2E7D32 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', width: 400, boxShadow: '0 25px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56 }}>🐄</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1B5E20', margin: '8px 0 4px' }}>PashuBazaar</h1>
          <p style={{ fontSize: 14, color: '#888' }}>Admin Panel</p>
        </div>
        <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 12, padding: 3, marginBottom: 24 }}>
          {['login', 'signup'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1B5E20' : '#999', boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #E8E8E8', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
        <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #E8E8E8', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />
        {err && <p style={{ color: '#DC2626', fontSize: 13, margin: '0 0 12px', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{err}</p>}
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: loading ? '#999' : 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'default' : 'pointer' }}>
          {loading ? 'Please wait...' : tab === 'login' ? 'Login →' : 'Create Account →'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16 }}>First time? Sign up to create your admin account.</p>
      </div>
    </div>
  );
}

// ═══════ MAIN ADMIN APP ═══════
export default function Page() {
  const { user, loading: authLoading, logout } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [sidebar, setSidebar] = useState(true);
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [seeded, setSeeded] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [adConfig, setAdConfig] = useState(null);
  const [adSettings, setAdSettings] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [platformSettings, setPlatformSettings] = useState(null);

  // Ad Manager states
  const [adPlatform, setAdPlatform] = useState('android');
  const [adSub, setAdSub] = useState('units');
  const [listFilter, setListFilter] = useState('all');
  const [reportFilter, setReportFilter] = useState('all');

  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  // Seed + load data
  useEffect(() => {
    if (!user) return;
    const init = async () => {
      await seedInitialData();
      setSeeded(true);
    };
    init();
  }, [user]);

  // Real-time listeners
  useEffect(() => {
    if (!user || !seeded) return;
    const unsubs = [];
    unsubs.push(onSnapshot(collection(db, 'users'), s => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(collection(db, 'listings'), s => setListings(s.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(collection(db, 'reports'), s => setReports(s.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(collection(db, 'categories'), s => setCategories(s.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(collection(db, 'languages'), s => setLanguages(s.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(doc(db, 'config', 'admob'), s => s.exists() && setAdConfig(s.data())));
    unsubs.push(onSnapshot(doc(db, 'config', 'ad_settings'), s => s.exists() && setAdSettings(s.data())));
    unsubs.push(onSnapshot(collection(db, 'ad_placements'), s => setPlacements(s.docs.map(d => ({ id: d.id, ...d.data() })))));
    unsubs.push(onSnapshot(doc(db, 'config', 'platform'), s => s.exists() && setPlatformSettings(s.data())));
    return () => unsubs.forEach(u => u());
  }, [user, seeded]);

  // Theme
  const bg = dark ? '#0F1117' : '#F4F5F7';
  const card = dark ? '#1A1D27' : '#FFFFFF';
  const txt = dark ? '#E8E8EC' : '#1A1A2E';
  const txt2 = dark ? '#8B8D97' : '#6B7280';
  const bdr = dark ? '#2A2D3A' : '#E8E8EC';
  const accent = '#1B7A3D';
  const accentBg = dark ? '#1B7A3D22' : '#1B7A3D10';
  const hov = dark ? '#22253A' : '#F0F7F1';
  const sideBg = dark ? '#141620' : '#FAFBFC';

  if (authLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 56 }}>🐄</div><p style={{ color: '#888', marginTop: 8 }}>Loading...</p></div></div>;
  if (!user) return <LoginScreen />;

  const StatusBadge = ({ status }) => {
    const c = { active: ['#ECFDF5','#047857','#10B981'], pending: ['#FEF3C7','#B45309','#F59E0B'], suspended: ['#FEF2F2','#B91C1C','#EF4444'], banned: ['#FEE2E2','#991B1B','#DC2626'], rejected: ['#FEE2E2','#991B1B','#DC2626'], open: ['#FEF3C7','#B45309','#F59E0B'], investigating: ['#DBEAFE','#1D4ED8','#3B82F6'], resolved: ['#ECFDF5','#047857','#10B981'], completed: ['#ECFDF5','#047857','#10B981'], refunded: ['#FEF3C7','#B45309','#F59E0B'] }[status] || ['#F3F4F6','#6B7280','#9CA3AF'];
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: c[0], fontSize: 12, fontWeight: 700, color: c[1], textTransform: 'capitalize' }}><span style={{ width: 6, height: 6, borderRadius: 3, background: c[2] }}/>{status}</span>;
  };

  const Toggle = ({ on, onChange }) => (
    <button onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: on ? accent : '#D1D5DB', cursor: 'pointer', position: 'relative' }}>
      <div style={{ width: 18, height: 18, borderRadius: 9, background: '#fff', position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}/>
    </button>
  );

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'admob', label: 'Ad Manager', icon: '📺', badge: 'NEW' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'listings', label: 'Listings', icon: '📋' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'reports', label: 'Reports', icon: '⚠️', badge: reports.filter(r => r.status === 'open').length || null },
    { id: 'languages', label: 'Languages', icon: '🌍' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  // ─── HELPER: Update Ad Unit ───
  const updateAdUnit = async (unitId, field, value) => {
    if (!adConfig) return;
    const platform = adConfig[adPlatform];
    const units = platform.units.map(u => u.id === unitId ? { ...u, [field]: value } : u);
    await setDoc(doc(db, 'config', 'admob'), { ...adConfig, [adPlatform]: { ...platform, units }, updatedAt: serverTimestamp() }, { merge: true });
    notify(`Ad unit updated`);
  };

  // ─── DASHBOARD ───
  const renderDashboard = () => (
    <div className="animate-fadeUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 26, fontWeight: 900, color: txt, margin: 0 }}>Dashboard</h1><p style={{ fontSize: 14, color: txt2, margin: '4px 0 0' }}>Welcome back! Here's your PashuBazaar overview.</p></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[['Total Users', users.length || '0', '+12.5%', true, '👥'], ['Listings', listings.length || '0', '+8.3%', true, '📋'], ['Categories', categories.length || '0', '', true, '🏷️'], ['Reports', reports.filter(r=>r.status==='open').length || '0', '', false, '⚠️']].map(([l,v,ch,up,ic], i) => (
          <div key={i} style={{ background: card, borderRadius: 16, padding: 22, border: `1px solid ${bdr}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 50, opacity: .05 }}>{ic}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: txt2, marginBottom: 8 }}>{l}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: txt }}>{v}</div>
            {ch && <div style={{ fontSize: 12, fontWeight: 700, color: up ? '#10B981' : '#EF4444', marginTop: 4 }}>{up?'↑':'↓'} {ch}</div>}
          </div>
        ))}
      </div>
      {/* AdMob Quick Card */}
      {adConfig && <div style={{ background: `linear-gradient(135deg, ${dark?'#1a2332':'#F0FFF4'}, ${dark?'#16222e':'#E8F5E9'})`, borderRadius: 16, padding: 22, border: `1px solid ${dark?'#2a3a4a':'#C8E6C9'}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 28 }}>📺</span><div><div style={{ fontSize: 16, fontWeight: 800, color: txt }}>AdMob Configuration</div><div style={{ fontSize: 12, color: txt2 }}>Manage ad units from Ad Manager section</div></div></div>
          <button onClick={() => { setSection('admob'); }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Open Ad Manager →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[['Android Units', adConfig.android?.units?.length || 0, '🤖'], ['iOS Units', adConfig.ios?.units?.length || 0, '🍎'], ['Placements', placements.length, '📍']].map(([l,v,ic],i)=>(
            <div key={i} style={{ background: card, borderRadius: 10, padding: 14, border: `1px solid ${bdr}`, textAlign: 'center' }}><span style={{ fontSize: 22 }}>{ic}</span><div style={{ fontSize: 20, fontWeight: 900, color: txt, marginTop: 4 }}>{v}</div><div style={{ fontSize: 11, color: txt2 }}>{l}</div></div>
          ))}
        </div>
      </div>}
      {/* Recent data */}
      <div style={{ background: card, borderRadius: 16, padding: 24, border: `1px solid ${bdr}` }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: txt, margin: '0 0 16px' }}>Recent Listings</h3>
        {listings.length === 0 ? <p style={{ color: txt2, fontSize: 14 }}>No listings yet. Data will appear here when users post ads in the app.</p> :
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Title','Category','Price','Status'].map(h=><th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: txt2, textTransform: 'uppercase', borderBottom: `1px solid ${bdr}` }}>{h}</th>)}</tr></thead>
            <tbody>{listings.slice(0,5).map(l=><tr key={l.id}><td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: txt }}>{l.title}</td><td style={{ padding: '12px', fontSize: 13, color: txt2 }}>{l.category}</td><td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: txt }}>₹{l.price?.toLocaleString()}</td><td style={{ padding: '12px' }}><StatusBadge status={l.status || 'active'}/></td></tr>)}</tbody>
          </table>
        }
      </div>
    </div>
  );

  // ─── AD MANAGER ───
  const renderAdMob = () => {
    if (!adConfig) return <div style={{ textAlign: 'center', padding: 40, color: txt2 }}>Loading ad configuration...</div>;
    const platform = adConfig[adPlatform];
    const typeIcons = { 'App Open':'🚀','Interstitial':'📱','Rewarded':'🎬','Rewarded Interstitial':'🎁','Banner':'📢','Native':'📄' };
    const typeColors = { 'App Open':'#8B5CF6','Interstitial':'#3B82F6','Rewarded':'#10B981','Rewarded Interstitial':'#06B6D4','Banner':'#F59E0B','Native':'#EC4899' };

    return (
      <div className="animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div><h1 style={{ fontSize: 26, fontWeight: 900, color: txt, margin: 0 }}>📺 Ad Manager</h1><p style={{ fontSize: 13, color: txt2, margin: '3px 0 0' }}>Manage AdMob units, placements & settings — saved to Firebase in real-time</p></div>
          <div style={{ display: 'flex', background: dark?'#22253A':'#F0F0F0', borderRadius: 10, padding: 3 }}>
            {['android','ios'].map(p=><button key={p} onClick={()=>setAdPlatform(p)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: adPlatform===p?accent:'transparent', color: adPlatform===p?'#fff':txt2 }}>{p==='android'?'🤖 Android':'🍎 iOS'}</button>)}
          </div>
        </div>
        {/* App ID */}
        <div style={{ background: dark?'#1E2130':'#F8F9FA', borderRadius: 12, padding: '12px 18px', marginBottom: 16, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 20 }}>{adPlatform==='android'?'🤖':'🍎'}</span><div><div style={{ fontSize: 11, fontWeight: 600, color: txt2 }}>{adPlatform==='android'?'Android':'iOS'} App ID</div><div style={{ fontSize: 14, fontWeight: 800, color: accent, fontFamily: 'monospace' }}>{platform?.appId}</div></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: '#10B981' }}/><span style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>Live</span></div>
        </div>
        {/* Sub tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: dark?'#1E2130':'#F3F4F6', borderRadius: 12, padding: 4 }}>
          {[['units','📋 Ad Units'],['placements','📍 Placements'],['settings','⚙️ Settings']].map(([id,label])=>(
            <button key={id} onClick={()=>setAdSub(id)} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: adSub===id?card:'transparent', color: adSub===id?txt:txt2, boxShadow: adSub===id?'0 2px 8px rgba(0,0,0,.06)':'none' }}>{label}</button>
          ))}
        </div>

        {/* AD UNITS */}
        {adSub === 'units' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {platform?.units?.map(unit => { const color = typeColors[unit.type]||'#888'; return (
            <div key={unit.id} style={{ background: card, borderRadius: 14, border: `1px solid ${bdr}`, overflow: 'hidden', opacity: unit.enabled?1:.5 }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 18 }}>{typeIcons[unit.type]}</span></div><div><div style={{ fontSize: 14, fontWeight: 800, color: txt }}>{unit.type}</div><div style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase' }}>{unit.priority} priority</div></div></div>
                <Toggle on={unit.enabled} onChange={()=>updateAdUnit(unit.id, 'enabled', !unit.enabled)} />
              </div>
              <div style={{ padding: '12px 18px', borderBottom: `1px solid ${bdr}` }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: txt2, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Ad Unit ID</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input defaultValue={unit.unitId} id={`unit-${unit.id}`} placeholder="ca-app-pub-XXXXX/XXXXXXX" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${bdr}`, fontSize: 12, fontFamily: 'monospace', background: dark?'#22253A':'#F8F9FA', color: txt, boxSizing: 'border-box' }} />
                  <button onClick={() => { const val = document.getElementById(`unit-${unit.id}`).value; updateAdUnit(unit.id, 'unitId', val); }} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                </div>
              </div>
              <div style={{ padding: '10px 18px' }}><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{unit.screens?.map(s=><span key={s} style={{ padding: '3px 8px', borderRadius: 6, background: `${color}15`, color, fontSize: 10, fontWeight: 700 }}>{s}</span>)}</div></div>
            </div>
          ); })}
        </div>}

        {/* PLACEMENTS */}
        {adSub === 'placements' && <div>
          {placements.map(p => { const color = typeColors[p.adType]||'#888'; return (
            <div key={p.id} style={{ background: card, borderRadius: 12, padding: '16px 20px', border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', gap: 16, opacity: p.enabled?1:.45, marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 20 }}>{typeIcons[p.adType]}</span></div>
              <div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}><span style={{ fontSize: 14, fontWeight: 700, color: txt }}>{p.name}</span><span style={{ padding: '2px 8px', borderRadius: 6, background: `${color}18`, color, fontSize: 10, fontWeight: 700 }}>{p.adType}</span></div><div style={{ fontSize: 12, color: txt2 }}>{p.description}</div><div style={{ fontSize: 11, color: txt2, marginTop: 3 }}>Screen: <strong style={{ color: txt }}>{p.screen}</strong> • Freq: <strong style={{ color: txt }}>{p.frequency}</strong></div></div>
              <Toggle on={p.enabled} onChange={async () => { await setDoc(doc(db, 'ad_placements', p.id), { ...p, enabled: !p.enabled, updatedAt: serverTimestamp() }); notify(`"${p.name}" ${p.enabled?'disabled':'enabled'}`); }} />
            </div>
          ); })}
        </div>}

        {/* SETTINGS */}
        {adSub === 'settings' && adSettings && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ background: card, borderRadius: 14, padding: 22, border: `1px solid ${bdr}` }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: txt, margin: '0 0 18px' }}>⏱ Frequency Control</h3>
            {[['Interstitial Frequency','interstitialFrequency'],['Interstitial Cooldown (s)','interstitialCooldownSec'],['Rewarded Cooldown (s)','rewardedCooldownSec'],['App Open Cooldown (s)','appOpenCooldownSec'],['Banner Refresh (s)','bannerRefreshSec']].map(([label,key])=>(
              <div key={key} style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: txt }}>{label}</span>
                <input type="number" defaultValue={adSettings[key]} id={`as-${key}`} style={{ width: 70, padding: '8px 10px', borderRadius: 8, border: `1px solid ${bdr}`, fontSize: 14, fontWeight: 700, textAlign: 'center', background: dark?'#22253A':'#F8F9FA', color: txt }} />
              </div>
            ))}
          </div>
          <div style={{ background: card, borderRadius: 14, padding: 22, border: `1px solid ${bdr}` }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: txt, margin: '0 0 18px' }}>🛡️ Limits & Safety</h3>
            {[['Max Ads/Session','maxAdsPerSession'],['Max Interstitial/Hour','maxInterstitialPerHour']].map(([label,key])=>(
              <div key={key} style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: txt }}>{label}</span>
                <input type="number" defaultValue={adSettings[key]} id={`as-${key}`} style={{ width: 70, padding: '8px 10px', borderRadius: 8, border: `1px solid ${bdr}`, fontSize: 14, fontWeight: 700, textAlign: 'center', background: dark?'#22253A':'#F8F9FA', color: txt }} />
              </div>
            ))}
            <div style={{ height: 1, background: bdr, margin: '16px 0' }}/>
            {[['Skip First Interstitial','skipFirstInterstitial'],['Show Ads to New Users','showAdsToNewUsers'],['Test Mode','testMode'],['Mediation','mediationEnabled'],['GDPR Consent','consentRequired'],['Child Directed','childDirectedTreatment']].map(([label,key])=>(
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: txt }}>{label}</span>
                <Toggle on={adSettings[key]} onChange={async () => { await setDoc(doc(db, 'config', 'ad_settings'), { ...adSettings, [key]: !adSettings[key], updatedAt: serverTimestamp() }); notify(`${label} toggled`); }} />
              </div>
            ))}
            <button onClick={async () => {
              const updates = {};
              ['interstitialFrequency','interstitialCooldownSec','rewardedCooldownSec','appOpenCooldownSec','bannerRefreshSec','maxAdsPerSession','maxInterstitialPerHour'].forEach(k => {
                const el = document.getElementById(`as-${k}`);
                if (el) updates[k] = parseInt(el.value) || 0;
              });
              await setDoc(doc(db, 'config', 'ad_settings'), { ...adSettings, ...updates, updatedAt: serverTimestamp() });
              notify('All ad settings saved to Firebase!');
            }} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>💾 Save All Settings</button>
          </div>
        </div>}
      </div>
    );
  };

  // ─── USERS ───
  const renderUsers = () => (
    <div className="animate-fadeUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h1 style={{ fontSize: 26, fontWeight: 900, color: txt, margin: 0 }}>Users Management</h1><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${bdr}`, fontSize: 13, width: 200, background: card, color: txt }} /></div>
      {users.length === 0 ? <div style={{ background: card, borderRadius: 16, padding: 40, border: `1px solid ${bdr}`, textAlign: 'center' }}><p style={{ fontSize: 48 }}>👥</p><p style={{ color: txt2, fontSize: 14 }}>No users registered yet. Users will appear here when they sign up in the app.</p></div> :
      <div style={{ background: card, borderRadius: 16, border: `1px solid ${bdr}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['User','Phone','Location','Status','Actions'].map(h=><th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: txt2, textTransform: 'uppercase', borderBottom: `1px solid ${bdr}`, background: dark?'#1E2130':'#FAFBFC' }}>{h}</th>)}</tr></thead>
          <tbody>{users.filter(u=>!search||u.name?.toLowerCase().includes(search.toLowerCase())).map(u=>(
            <tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background=hov} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: txt }}>{u.name || u.email || 'User'}</td>
              <td style={{ padding: '14px 16px', fontSize: 13, color: txt2 }}>{u.phone || '-'}</td>
              <td style={{ padding: '14px 16px', fontSize: 13, color: txt2 }}>{u.location || '-'}</td>
              <td style={{ padding: '14px 16px' }}><StatusBadge status={u.status || 'active'}/></td>
              <td style={{ padding: '14px 16px' }}><button onClick={async()=>{await updateDoc(doc(db,'users',u.id),{status: u.status==='active'?'suspended':'active'}); notify(`User ${u.status==='active'?'suspended':'activated'}`);}} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${u.status==='active'?'#FCA5A5':accent+'44'}`, background: u.status==='active'?'#FEF2F2':accentBg, color: u.status==='active'?'#DC2626':accent, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{u.status==='active'?'Suspend':'Activate'}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>}
    </div>
  );

  // ─── LISTINGS ───
  const renderListings = () => (
    <div className="animate-fadeUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: txt, margin: 0 }}>Listings Management</h1>
        <div style={{ display: 'flex', gap: 8 }}>{['all','active','pending','rejected'].map(f=><button key={f} onClick={()=>setListFilter(f)} style={{ padding: '8px 14px', borderRadius: 8, border: listFilter===f?`2px solid ${accent}`:`1px solid ${bdr}`, background: listFilter===f?accentBg:card, fontSize: 12, fontWeight: 700, color: listFilter===f?accent:txt2, cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>)}</div>
      </div>
      {listings.length === 0 ? <div style={{ background: card, borderRadius: 16, padding: 40, border: `1px solid ${bdr}`, textAlign: 'center' }}><p style={{ fontSize: 48 }}>📋</p><p style={{ color: txt2, fontSize: 14 }}>No listings yet. They'll appear when users post ads.</p></div> :
      <div style={{ background: card, borderRadius: 16, border: `1px solid ${bdr}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Title','Category','Price','Status','Actions'].map(h=><th key={h} style={{ textAlign: 'left', padding: '14px 12px', fontSize: 11, fontWeight: 700, color: txt2, textTransform: 'uppercase', borderBottom: `1px solid ${bdr}`, background: dark?'#1E2130':'#FAFBFC' }}>{h}</th>)}</tr></thead>
          <tbody>{listings.filter(l=>listFilter==='all'||l.status===listFilter).map(l=>(
            <tr key={l.id} onMouseEnter={e=>e.currentTarget.style.background=hov} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: txt }}>{l.title}</td>
              <td style={{ padding: '12px', fontSize: 12, color: txt2 }}>{l.category}</td>
              <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: txt }}>₹{l.price?.toLocaleString()}</td>
              <td style={{ padding: '12px' }}><StatusBadge status={l.status||'active'}/></td>
              <td style={{ padding: '12px' }}><div style={{ display: 'flex', gap: 4 }}>
                {l.status==='pending'&&<><button onClick={async()=>{await updateDoc(doc(db,'listings',l.id),{status:'active'});notify('Approved ✅');}} style={{ padding: '5px 8px', borderRadius: 6, border: 'none', background: '#ECFDF5', color: '#047857', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓</button><button onClick={async()=>{await updateDoc(doc(db,'listings',l.id),{status:'rejected'});notify('Rejected');}} style={{ padding: '5px 8px', borderRadius: 6, border: 'none', background: '#FEF2F2', color: '#DC2626', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✗</button></>}
                {l.status==='active'&&<button onClick={async()=>{await deleteDoc(doc(db,'listings',l.id));notify('Removed');}} style={{ padding: '5px 8px', borderRadius: 6, border: 'none', background: '#FEF2F2', color: '#DC2626', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>🗑</button>}
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>}
    </div>
  );

  // ─── CATEGORIES ───
  const renderCategories = () => (
    <div className="animate-fadeUp">
      <h1 style={{ fontSize: 26, fontWeight: 900, color: txt, margin: '0 0 24px' }}>Category Management</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {categories.map(cat=>(
          <div key={cat.id} style={{ background: card, borderRadius: 16, padding: 22, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', gap: 16, opacity: cat.active?1:.5 }}>
            <span style={{ fontSize: 42, width: 60, height: 60, borderRadius: 16, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat.icon}</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: txt }}>{cat.name}</div><div style={{ fontSize: 13, color: txt2 }}>{cat.listings?.toLocaleString()} listings</div></div>
            <Toggle on={cat.active} onChange={async()=>{await updateDoc(doc(db,'categories',cat.id),{active:!cat.active});notify(`${cat.name} ${cat.active?'disabled':'enabled'}`);}} />
          </div>
        ))}
      </div>
      <div style={{ background: card, borderRadius: 16, padding: 24, border: `1px solid ${bdr}`, marginTop: 24 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: txt, margin: '0 0 16px' }}>🥛 Milk Animal Custom Fields</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>{['Milk Capacity (L/Day)','Lactation Number','Pregnant (Yes/No)','Teeth Count','Calving History','Feed Type','Health Certificate','Last Vet Visit'].map(f=><div key={f} style={{ padding: 12, borderRadius: 10, background: '#FFF8E1', border: '1px solid #FFE082', fontSize: 12, fontWeight: 600, color: '#795548', textAlign: 'center' }}>{f}</div>)}</div>
      </div>
    </div>
  );

  // ─── REPORTS ───
  const renderReports = () => (
    <div className="animate-fadeUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: txt, margin: 0 }}>Reports & Moderation</h1>
        <div style={{ display: 'flex', gap: 8 }}>{['all','open','investigating','resolved'].map(f=><button key={f} onClick={()=>setReportFilter(f)} style={{ padding: '8px 14px', borderRadius: 8, border: reportFilter===f?'2px solid #E53935':`1px solid ${bdr}`, background: reportFilter===f?'#FEF2F2':card, fontSize: 12, fontWeight: 700, color: reportFilter===f?'#E53935':txt2, cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>)}</div>
      </div>
      {reports.length === 0 ? <div style={{ background: card, borderRadius: 16, padding: 40, border: `1px solid ${bdr}`, textAlign: 'center' }}><p style={{ fontSize: 48 }}>✅</p><p style={{ color: txt2, fontSize: 14 }}>No reports yet. Great — everything looks clean!</p></div> :
      reports.filter(r=>reportFilter==='all'||r.status===reportFilter).map(r=>(
        <div key={r.id} style={{ background: card, borderRadius: 16, padding: 20, border: `1px solid ${bdr}`, borderLeft: `4px solid ${r.priority==='critical'?'#DC2626':r.priority==='high'?'#EA580C':'#D97706'}`, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: txt }}>{r.listing} — <StatusBadge status={r.status}/></div>
          <div style={{ fontSize: 13, color: txt2, margin: '6px 0' }}>{r.reason}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {r.status==='open'&&<button onClick={async()=>{await updateDoc(doc(db,'reports',r.id),{status:'resolved'});notify('Resolved');}} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#ECFDF5', color: '#047857', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✅ Resolve</button>}
          </div>
        </div>
      ))}
    </div>
  );

  // ─── LANGUAGES ───
  const renderLanguages = () => (
    <div className="animate-fadeUp">
      <h1 style={{ fontSize: 26, fontWeight: 900, color: txt, margin: '0 0 24px' }}>Language Management 🌍</h1>
      <div style={{ background: card, borderRadius: 16, border: `1px solid ${bdr}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Language','Code','Users','Translation','Status','Actions'].map(h=><th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: txt2, textTransform: 'uppercase', borderBottom: `1px solid ${bdr}`, background: dark?'#1E2130':'#FAFBFC' }}>{h}</th>)}</tr></thead>
          <tbody>{languages.map(l=>(
            <tr key={l.id} onMouseEnter={e=>e.currentTarget.style.background=hov} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: txt }}>{l.name}</td>
              <td style={{ padding: '14px 16px', fontSize: 12, fontFamily: 'monospace', color: txt2 }}>{l.code}</td>
              <td style={{ padding: '14px 16px', fontSize: 13, color: txt2 }}>{l.users?.toLocaleString()}</td>
              <td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ flex: 1, height: 8, borderRadius: 4, background: dark?'#2A2D3A':'#F0F0F0', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 4, background: l.completion>=90?'#10B981':l.completion>=70?'#F59E0B':'#EF4444', width: `${l.completion}%` }}/></div><span style={{ fontSize: 12, fontWeight: 700, color: txt, minWidth: 35 }}>{l.completion}%</span></div></td>
              <td style={{ padding: '14px 16px' }}><StatusBadge status={l.active?'active':'pending'}/></td>
              <td style={{ padding: '14px 16px' }}><button onClick={async()=>{await setDoc(doc(db,'languages',l.id),{...l,active:!l.active,updatedAt:serverTimestamp()});notify(`${l.name} ${l.active?'disabled':'enabled'}`);}} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: l.active?'#FEF2F2':'#ECFDF5', color: l.active?'#DC2626':'#047857', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{l.active?'Disable':'Enable'}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );

  // ─── REVENUE ───
  const renderRevenue = () => (
    <div className="animate-fadeUp">
      <h1 style={{ fontSize: 26, fontWeight: 900, color: txt, margin: '0 0 24px' }}>Revenue & Transactions 💰</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[['This Month','₹0','💰'],['Premium Ads','0','⭐'],['Avg Transaction','₹0','📈']].map(([l,v,ic],i)=>(
          <div key={i} style={{ background: card, borderRadius: 16, padding: 22, border: `1px solid ${bdr}` }}><span style={{ fontSize: 28 }}>{ic}</span><div style={{ fontSize: 24, fontWeight: 900, color: txt, margin: '8px 0 4px' }}>{v}</div><div style={{ fontSize: 13, color: txt2 }}>{l}</div></div>
        ))}
      </div>
      <div style={{ background: card, borderRadius: 16, padding: 24, border: `1px solid ${bdr}`, textAlign: 'center' }}>
        <p style={{ fontSize: 48 }}>📊</p>
        <p style={{ color: txt2, fontSize: 14 }}>Revenue data will populate as transactions flow through the app.</p>
      </div>
    </div>
  );

  // ─── SETTINGS ───
  const renderSettings = () => (
    <div className="animate-fadeUp">
      <h1 style={{ fontSize: 26, fontWeight: 900, color: txt, margin: '0 0 24px' }}>Platform Settings</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: card, borderRadius: 16, padding: 24, border: `1px solid ${bdr}` }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: txt, margin: '0 0 20px' }}>⚙️ General</h3>
          {[['App Name','appName'],['Support Email','supportEmail'],['Support Phone','supportPhone'],['Max Photos/Ad','maxPhotosPerAd']].map(([label,key])=>(
            <div key={key} style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 700, color: txt2, display: 'block', marginBottom: 4 }}>{label}</label><input defaultValue={platformSettings?.[key]||''} id={`ps-${key}`} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${bdr}`, fontSize: 13, boxSizing: 'border-box', background: dark?'#22253A':'#F8F9FA', color: txt }} /></div>
          ))}
        </div>
        <div style={{ background: card, borderRadius: 16, padding: 24, border: `1px solid ${bdr}` }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: txt, margin: '0 0 20px' }}>💳 Monetization</h3>
          {[['Premium Ad (₹)','premiumAdPrice'],['Featured Listing (₹)','featuredListingPrice'],['Boost Ad (₹)','boostAdPrice'],['Commission (%)','commissionRate']].map(([label,key])=>(
            <div key={key} style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 700, color: txt2, display: 'block', marginBottom: 4 }}>{label}</label><input defaultValue={platformSettings?.[key]||''} id={`ps-${key}`} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${bdr}`, fontSize: 13, boxSizing: 'border-box', background: dark?'#22253A':'#F8F9FA', color: txt }} /></div>
          ))}
          <button onClick={async () => {
            const updates = {};
            ['appName','supportEmail','supportPhone','maxPhotosPerAd','premiumAdPrice','featuredListingPrice','boostAdPrice','commissionRate'].forEach(k => {
              const el = document.getElementById(`ps-${k}`);
              if (el) updates[k] = isNaN(el.value) ? el.value : Number(el.value);
            });
            await setDoc(doc(db, 'config', 'platform'), { ...platformSettings, ...updates, updatedAt: serverTimestamp() });
            notify('Platform settings saved!');
          }} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>Save Settings</button>
        </div>
      </div>
    </div>
  );

  const screens = { dashboard: renderDashboard, admob: renderAdMob, users: renderUsers, listings: renderListings, categories: renderCategories, reports: renderReports, languages: renderLanguages, revenue: renderRevenue, settings: renderSettings };

  return (
    <div style={{ display: 'flex', height: '100vh', background: bg, overflow: 'hidden', color: txt }}>
      {/* Sidebar */}
      <div style={{ width: sidebar?250:68, background: sideBg, borderRight: `1px solid ${bdr}`, display: 'flex', flexDirection: 'column', transition: 'width .3s', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: sidebar?'20px 20px 16px':'20px 14px 16px', borderBottom: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={()=>setSidebar(!sidebar)}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🐄</span>
          {sidebar&&<span style={{ fontSize: 18, fontWeight: 900, color: accent }}>PashuBazaar</span>}
        </div>
        {sidebar&&<div style={{ padding: '8px 20px', fontSize: 10, fontWeight: 700, color: txt2, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8 }}>Admin Panel</div>}
        <nav style={{ flex: 1, padding: '4px 8px', overflow: 'auto' }}>
          {NAV.map(item=>(
            <button key={item.id} onClick={()=>setSection(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, border: 'none', background: section===item.id?accentBg:'transparent', color: section===item.id?accent:txt2, fontSize: 13, fontWeight: section===item.id?700:600, cursor: 'pointer', marginBottom: 2, textAlign: 'left', position: 'relative', whiteSpace: 'nowrap' }}
              onMouseEnter={e=>{if(section!==item.id)e.currentTarget.style.background=hov}} onMouseLeave={e=>{if(section!==item.id)e.currentTarget.style.background='transparent'}}>
              <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: 'center' }}>{item.icon}</span>
              {sidebar&&<span>{item.label}</span>}
              {item.badge&&sidebar&&<span style={{ marginLeft: 'auto', background: typeof item.badge==='number'?'#EF4444':'linear-gradient(135deg,#F59E0B,#EF6C00)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>{item.badge}</span>}
              {section===item.id&&<div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, borderRadius: 2, background: accent }}/>}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 12px 16px', borderTop: `1px solid ${bdr}` }}>
          <button onClick={()=>setDark(!dark)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', background: dark?'#22253A':'#F0F0F0', color: txt2, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 16 }}>{dark?'☀️':'🌙'}</span>{sidebar&&<span>{dark?'Light Mode':'Dark Mode'}</span>}
          </button>
        </div>
      </div>
      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 64, background: card, borderBottom: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button onClick={()=>setSidebar(!sidebar)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: txt2 }}>☰</button><span style={{ fontSize: 15, fontWeight: 700, color: txt, textTransform: 'capitalize' }}>{section==='admob'?'Ad Manager':section}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: txt2 }}>{user?.email}</span>
            <button onClick={logout} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${bdr}`, background: card, color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>{screens[section]?.()}</div>
      </div>
      {/* Toast */}
      {toast&&<div style={{ position: 'fixed', bottom: 24, right: 24, padding: '14px 24px', borderRadius: 12, background: toast.type==='success'?'#065F46':'#991B1B', color: '#fff', fontSize: 14, fontWeight: 600, boxShadow: '0 10px 40px rgba(0,0,0,.2)', zIndex: 999 }} className="animate-slideIn">{toast.type==='success'?'✅':'❌'} {toast.msg}</div>}
    </div>
  );
}
