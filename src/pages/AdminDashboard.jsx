import React, { useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, UserPlus, Calendar, 
  ArrowUpRight, Filter, Download, Search,
  TrendingUp, Activity, ShieldCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const { theme } = useContext(AppContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    active24h: 0,
    active7d: 0,
    newToday: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Remove orderBy because it filters out documents that don't have the field
      const querySnapshot = await getDocs(usersRef);
      
      const allUsers = [];
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const sevenDays = 7 * oneDay;

      let total = 0;
      let a24h = 0;
      let a7d = 0;
      let nToday = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        
        if (data.lastActive && (now - data.lastActive < oneDay)) a24h++;
        if (data.lastActive && (now - data.lastActive < sevenDays)) a7d++;
        if (data.createdAt && (now - data.createdAt < oneDay)) nToday++;
        
        allUsers.push({
          id: doc.id,
          ...data
        });
      });

      setStats({
        totalUsers: total,
        active24h: a24h,
        active7d: a7d,
        newToday: nToday
      });
      
      // Sort users by createdAt desc in memory (handling users with null createdAt)
      const sortedUsers = allUsers.sort((a, b) => {
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;
        return timeB - timeA;
      });
      
      setRecentUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = recentUsers.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="loader"></div>
        <p style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>Loading Intelligence Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 24px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>
            <ShieldCheck size={20} />
            <span style={{ fontWeight: 600, letterSpacing: '1px', fontSize: '0.85rem' }}>OFFICIAL ADMIN PANEL</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>
            Nexa <span className="text-gradient">Intelligence</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Real-time analytics and user management for Nexa News.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={fetchAdminData} className="glass-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
            <Activity size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard 
          icon={<Users color="#3b82f6" />} 
          label="Total Registered" 
          value={stats.totalUsers} 
          trend="+12%" 
          color="#3b82f6"
        />
        <StatCard 
          icon={<UserCheck color="#10b981" />} 
          label="Active (24h)" 
          value={stats.active24h} 
          trend={`${Math.round((stats.active24h / stats.totalUsers) * 100)}%`} 
          color="#10b981"
        />
        <StatCard 
          icon={<TrendingUp color="#f59e0b" />} 
          label="Active (7d)" 
          value={stats.active7d} 
          trend="Steady" 
          color="#f59e0b"
        />
        <StatCard 
          icon={<UserPlus color="#ec4899" />} 
          label="New Today" 
          value={stats.newToday} 
          trend="Live" 
          color="#ec4899"
        />
      </div>

      {/* User Table Section */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Registered Users
          </h3>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 24px' }}>USER</th>
                <th style={{ padding: '12px 24px' }}>INTERESTS</th>
                <th style={{ padding: '12px 24px' }}>JOINED</th>
                <th style={{ padding: '12px 24px' }}>LAST ACTIVE</th>
                <th style={{ padding: '12px 24px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isActive = u.lastActive && (Date.now() - u.lastActive < 300000); // 5 mins
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {u.displayName?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.displayName || 'Anonymous'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {u.interests?.slice(0, 3).map(i => (
                          <span key={i} style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                            {i}
                          </span>
                        ))}
                        {u.interests?.length > 3 && <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>+{u.interests.length - 3}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>
                      {formatDate(u.lastActive)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem',
                        color: isActive ? '#10b981' : 'var(--text-secondary)'
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? '#10b981' : '#64748b' }} />
                        {isActive ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color }) => (
  <motion.div 
    whileHover={{ translateY: -5 }}
    className="glass-card" 
    style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ padding: '10px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ArrowUpRight size={12} color={color} /> {trend}
      </div>
    </div>
    <div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</div>
    </div>
  </motion.div>
);

export default AdminDashboard;
