import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, RefreshCw, Crown, Users, Trophy, Home, Shield, Settings, Eye, EyeOff } from 'lucide-react';

export default function CoCTracker() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [playerTags, setPlayerTags] = useState([]);
  const [clanTags, setClanTags] = useState([]);
  const [newPlayerTag, setNewPlayerTag] = useState('');
  const [newClanTag, setNewClanTag] = useState('');
  const [players, setPlayers] = useState([]);
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Load saved data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [keyResult, playersResult, clansResult] = await Promise.all([
        window.storage.get('coc_api_key').catch(() => null),
        window.storage.get('coc_player_tags').catch(() => null),
        window.storage.get('coc_clan_tags').catch(() => null)
      ]);

      if (keyResult) setApiKey(keyResult.value);
      if (playersResult) setPlayerTags(JSON.parse(playersResult.value));
      if (clansResult) setClanTags(JSON.parse(clansResult.value));
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        window.storage.set('coc_api_key', apiKey),
        window.storage.set('coc_player_tags', JSON.stringify(playerTags)),
        window.storage.set('coc_clan_tags', JSON.stringify(clanTags))
      ]);
    } catch (err) {
      console.error('Error saving data:', err);
    }
  };

  useEffect(() => {
    if (apiKey || playerTags.length > 0 || clanTags.length > 0) {
      saveData();
    }
  }, [apiKey, playerTags, clanTags]);

  const normalizeTag = (tag) => {
    tag = tag.trim().toUpperCase();
    if (!tag.startsWith('#')) tag = '#' + tag;
    return tag;
  };

  const addPlayerTag = () => {
    if (newPlayerTag.trim()) {
      const tag = normalizeTag(newPlayerTag);
      if (!playerTags.includes(tag)) {
        setPlayerTags([...playerTags, tag]);
      }
      setNewPlayerTag('');
    }
  };

  const addClanTag = () => {
    if (newClanTag.trim()) {
      const tag = normalizeTag(newClanTag);
      if (!clanTags.includes(tag)) {
        setClanTags([...clanTags, tag]);
      }
      setNewClanTag('');
    }
  };

  const removePlayerTag = (tag) => {
    setPlayerTags(playerTags.filter(t => t !== tag));
  };

  const removeClanTag = (tag) => {
    setClanTags(clanTags.filter(t => t !== tag));
  };

  const fetchData = async () => {
    if (!apiKey) {
      setError('Please enter your API key first');
      return;
    }

    setLoading(true);
    setError('');
    const fetchedPlayers = [];
    const fetchedClans = [];

    try {
      // Fetch all players
      for (const tag of playerTags) {
        try {
          const encodedTag = encodeURIComponent(tag);
          const response = await fetch(`https://api.clashofclans.com/v1/players/${encodedTag}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            fetchedPlayers.push(data);
          } else {
            console.error(`Failed to fetch player ${tag}:`, response.status);
          }
        } catch (err) {
          console.error(`Error fetching player ${tag}:`, err);
        }
      }

      // Fetch all clans
      for (const tag of clanTags) {
        try {
          const encodedTag = encodeURIComponent(tag);
          const response = await fetch(`https://api.clashofclans.com/v1/clans/${encodedTag}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            fetchedClans.push(data);
          } else {
            console.error(`Failed to fetch clan ${tag}:`, response.status);
          }
        } catch (err) {
          console.error(`Error fetching clan ${tag}:`, err);
        }
      }

      setPlayers(fetchedPlayers);
      setClans(fetchedClans);

      if (fetchedPlayers.length === 0 && fetchedClans.length === 0) {
        setError('No data fetched. Check your API key and tags.');
      }
    } catch (err) {
      setError('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerClan = (player) => {
    if (!player.clan) return null;
    return clans.find(c => c.tag === player.clan.tag) || player.clan;
  };

  const getAccountsInClan = (clanTag) => {
    return players.filter(p => p.clan && p.clan.tag === clanTag);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#ffffff',
      fontFamily: "'Rajdhani', sans-serif",
      padding: '2rem'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 900,
          background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ff9500 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
          marginBottom: '0.5rem',
          letterSpacing: '2px'
        }}>
          CLASH TRACKER
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#a0a0c0',
          fontWeight: 600,
          letterSpacing: '1px'
        }}>
          Track all your accounts and clans in one place
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {['overview', 'accounts', 'clans', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab 
                ? 'linear-gradient(135deg, #ffd700, #ff9500)'
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === tab ? '#0f0f23' : '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: activeTab === tab 
                ? '0 0 20px rgba(255, 215, 0, 0.5)'
                : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 215, 0, 0.2)'
        }}>
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: '#ffd700',
            fontWeight: 700
          }}>
            <Settings size={32} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Configuration
          </h2>

          {/* API Key */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#ffd700'
            }}>
              Clash of Clans API Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key from developer.clashofclans.com"
                style={{
                  width: '100%',
                  padding: '1rem',
                  paddingRight: '3rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#ffd700',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#a0a0c0', marginTop: '0.5rem' }}>
              Get your API key from <a href="https://developer.clashofclans.com/" target="_blank" style={{ color: '#ffd700' }}>developer.clashofclans.com</a>
            </p>
          </div>

          {/* Player Tags */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#ffd700'
            }}>
              Player Tags
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={newPlayerTag}
                onChange={(e) => setNewPlayerTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayerTag()}
                placeholder="#ABC123DEF"
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={addPlayerTag}
                style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #ffd700, #ff9500)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0f0f23',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                <Plus size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {playerTags.map(tag => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 215, 0, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 215, 0, 0.5)'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{tag}</span>
                  <button
                    onClick={() => removePlayerTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff4444',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Clan Tags */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#ffd700'
            }}>
              Clan Tags
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={newClanTag}
                onChange={(e) => setNewClanTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addClanTag()}
                placeholder="#XYZ789ABC"
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={addClanTag}
                style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #ffd700, #ff9500)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0f0f23',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                <Plus size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {clanTags.map(tag => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255, 215, 0, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 215, 0, 0.5)'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{tag}</span>
                  <button
                    onClick={() => removeClanTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff4444',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fetch Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.25rem',
              background: loading 
                ? 'rgba(255, 255, 255, 0.2)'
                : 'linear-gradient(135deg, #ffd700, #ff9500)',
              border: 'none',
              borderRadius: '12px',
              color: loading ? '#a0a0c0' : '#0f0f23',
              fontSize: '1.2rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s',
              boxShadow: loading ? 'none' : '0 0 20px rgba(255, 215, 0, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            <RefreshCw size={24} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Fetching...' : 'Fetch All Data'}
          </button>

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(255, 68, 68, 0.2)',
              border: '1px solid #ff4444',
              borderRadius: '8px',
              color: '#ff8888'
            }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {players.length === 0 && clans.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '2px dashed rgba(255, 215, 0, 0.3)'
            }}>
              <Search size={64} style={{ color: '#ffd700', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Data Yet</h3>
              <p style={{ color: '#a0a0c0', marginBottom: '1.5rem' }}>
                Go to Settings to add your API key and account tags, then fetch your data
              </p>
              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #ffd700, #ff9500)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0f0f23',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Go to Settings
              </button>
            </div>
          ) : (
            <div>
              <h2 style={{
                fontSize: '2rem',
                marginBottom: '1.5rem',
                color: '#ffd700',
                fontWeight: 700
              }}>
                Quick Overview
              </h2>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'rgba(255, 215, 0, 0.1)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffd700' }}>
                    {players.length}
                  </div>
                  <div style={{ color: '#a0a0c0', fontSize: '1.1rem' }}>Accounts</div>
                </div>
                <div style={{
                  background: 'rgba(255, 215, 0, 0.1)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffd700' }}>
                    {clans.length}
                  </div>
                  <div style={{ color: '#a0a0c0', fontSize: '1.1rem' }}>Clans</div>
                </div>
                <div style={{
                  background: 'rgba(255, 215, 0, 0.1)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffd700' }}>
                    {players.reduce((sum, p) => sum + p.trophies, 0).toLocaleString()}
                  </div>
                  <div style={{ color: '#a0a0c0', fontSize: '1.1rem' }}>Total Trophies</div>
                </div>
              </div>

              {/* Clan Breakdown */}
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                color: '#ffd700',
                fontWeight: 700
              }}>
                Accounts by Clan
              </h3>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {clans.map(clan => {
                  const accountsInClan = getAccountsInClan(clan.tag);
                  return (
                    <div
                      key={clan.tag}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 215, 0, 0.2)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <Shield size={32} style={{ color: '#ffd700' }} />
                          <div>
                            <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                              {clan.name}
                            </h4>
                            <p style={{ color: '#a0a0c0', fontSize: '0.9rem' }}>
                              {clan.tag} • Level {clan.clanLevel}
                            </p>
                          </div>
                        </div>
                        <div style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(255, 215, 0, 0.2)',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '1.1rem'
                        }}>
                          {accountsInClan.length} {accountsInClan.length === 1 ? 'account' : 'accounts'}
                        </div>
                      </div>
                      {accountsInClan.length > 0 && (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {accountsInClan.map(player => (
                            <div
                              key={player.tag}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                background: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '8px'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{player.name}</div>
                                <div style={{ color: '#a0a0c0', fontSize: '0.9rem' }}>
                                  TH{player.townHallLevel} • {player.tag}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Trophy size={18} style={{ color: '#ffd700' }} />
                                  <span style={{ fontWeight: 700 }}>{player.trophies.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Accounts without clan */}
              {players.filter(p => !p.clan).length > 0 && (
                <>
                  <h3 style={{
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    color: '#ffd700',
                    fontWeight: 700
                  }}>
                    Accounts Without Clan
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {players.filter(p => !p.clan).map(player => (
                      <div
                        key={player.tag}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          background: 'rgba(255, 68, 68, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 68, 68, 0.3)'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{player.name}</div>
                          <div style={{ color: '#a0a0c0', fontSize: '0.9rem' }}>
                            TH{player.townHallLevel} • {player.tag}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Trophy size={18} style={{ color: '#ffd700' }} />
                          <span style={{ fontWeight: 700 }}>{player.trophies.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: '#ffd700',
            fontWeight: 700
          }}>
            All Accounts
          </h2>
          {players.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px'
            }}>
              <p style={{ color: '#a0a0c0' }}>No accounts data available. Fetch data from Settings.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {players.map(player => {
                const clan = getPlayerClan(player);
                return (
                  <div
                    key={player.tag}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '1.5rem',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 215, 0, 0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: '#ffd700'
                      }}>
                        {player.name}
                      </h3>
                      <p style={{ color: '#a0a0c0', fontSize: '0.9rem' }}>{player.tag}</p>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '0.75rem',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Home size={18} style={{ color: '#ffd700' }} />
                          <span style={{ fontSize: '0.9rem', color: '#a0a0c0' }}>Town Hall</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                          {player.townHallLevel}
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '0.75rem',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Trophy size={18} style={{ color: '#ffd700' }} />
                          <span style={{ fontSize: '0.9rem', color: '#a0a0c0' }}>Trophies</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                          {player.trophies.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Crown size={18} style={{ color: '#ffd700' }} />
                        <span style={{ fontSize: '0.9rem', color: '#a0a0c0' }}>Experience</span>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        Level {player.expLevel}
                      </div>
                    </div>

                    {clan && (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 149, 0, 0.15))',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 215, 0, 0.4)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Shield size={18} style={{ color: '#ffd700' }} />
                          <span style={{ fontSize: '0.9rem', color: '#a0a0c0' }}>Clan</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                          {clan.name}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#a0a0c0', marginTop: '0.25rem' }}>
                          {player.role} • Level {clan.clanLevel || 'N/A'}
                        </div>
                      </div>
                    )}

                    {!clan && (
                      <div style={{
                        background: 'rgba(255, 68, 68, 0.15)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        textAlign: 'center',
                        color: '#ff8888'
                      }}>
                        No Clan
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Clans Tab */}
      {activeTab === 'clans' && (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: '#ffd700',
            fontWeight: 700
          }}>
            All Clans
          </h2>
          {clans.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px'
            }}>
              <p style={{ color: '#a0a0c0' }}>No clans data available. Fetch data from Settings.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {clans.map(clan => {
                const myAccounts = getAccountsInClan(clan.tag);
                return (
                  <div
                    key={clan.tag}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2rem',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'start',
                      justifyContent: 'space-between',
                      marginBottom: '1.5rem',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '2rem',
                          fontWeight: 700,
                          marginBottom: '0.5rem',
                          color: '#ffd700'
                        }}>
                          {clan.name}
                        </h3>
                        <p style={{ color: '#a0a0c0', fontSize: '1rem' }}>
                          {clan.tag} • Level {clan.clanLevel}
                        </p>
                        {clan.description && (
                          <p style={{
                            color: '#c0c0d0',
                            marginTop: '0.75rem',
                            fontSize: '0.95rem',
                            maxWidth: '600px'
                          }}>
                            {clan.description}
                          </p>
                        )}
                      </div>
                      <div style={{
                        padding: '1rem 1.5rem',
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 149, 0, 0.2))',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 215, 0, 0.4)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffd700' }}>
                          {myAccounts.length}
                        </div>
                        <div style={{ color: '#a0a0c0', fontSize: '0.9rem' }}>
                          Your {myAccounts.length === 1 ? 'Account' : 'Accounts'}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '1rem',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Users size={18} style={{ color: '#ffd700' }} />
                          <span style={{ fontSize: '0.9rem', color: '#a0a0c0' }}>Members</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                          {clan.members} / 50
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '1rem',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Trophy size={18} style={{ color: '#ffd700' }} />
                          <span style={{ fontSize: '0.9rem', color: '#a0a0c0' }}>Clan Points</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                          {clan.clanPoints.toLocaleString()}
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '1rem',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Shield size={18} style={{ color: '#ffd700' }} />
                          <span style={{ fontSize: '0.9rem', color: '#a0a0c0' }}>War League</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                          {clan.warLeague?.name || 'Unranked'}
                        </div>
                      </div>
                    </div>

                    {myAccounts.length > 0 && (
                      <div>
                        <h4 style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          marginBottom: '1rem',
                          color: '#ffd700'
                        }}>
                          Your Accounts in This Clan
                        </h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {myAccounts.map(player => (
                            <div
                              key={player.tag}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 215, 0, 0.2)'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                  {player.name}
                                </div>
                                <div style={{ color: '#a0a0c0', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                  {player.role} • TH{player.townHallLevel} • {player.tag}
                                </div>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 215, 0, 0.2)',
                                borderRadius: '8px'
                              }}>
                                <Trophy size={18} style={{ color: '#ffd700' }} />
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                  {player.trophies.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}