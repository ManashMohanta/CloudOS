import { useEffect, useState } from 'react'

import {
  Activity,
  Server,
  LayoutDashboard,
  Box,
  ChartNoAxesCombined,
  FileText,
  Settings,
  Bell,
  Search,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  RefreshCw,
  CircleCheck,
  CircleAlert,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
} from 'lucide-react'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import './App.css'


function App() {

  const [metrics, setMetrics] = useState(null)

  const [history, setHistory] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(false)

  const [activePage, setActivePage] = useState('Overview')


  // Fetch metrics from Django API
  async function FetchMetrics() {

    try {

      const response = await fetch('/api/metrics/')

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()

      setMetrics(data)

      setError(false)

      setHistory(previous => {

        const newPoint = {
          time: new Date().toLocaleTimeString(),
          cpu: data.cpu_usage,
          ram: data.memory.usage_percent,
        }

        return [...previous, newPoint].slice(-15)

      })

    } catch (err) {

      console.error('Metrics API error:', err)

      setError(true)

    } finally {

      setLoading(false)

    }

  }


  // Automatically refresh metrics every 5 seconds
  useEffect(() => {

    FetchMetrics()

    const interval = setInterval(FetchMetrics, 5000)

    return () => clearInterval(interval)

  }, [])


  const formatUptime = (seconds) => {

    if (seconds === undefined) return '--'

    const days = Math.floor(seconds / 86400)

    const hours = Math.floor((seconds % 86400) / 3600)

    const minutes = Math.floor((seconds % 3600) / 60)

    return `${days}d ${hours}h ${minutes}m`

  }


  const StatCard = ({
    title,
    value,
    unit,
    icon: Icon,
    description,
    color,
  }) => (

    <div className="stat-card">

      <div className="stat-top">

        <div>
          <p className="stat-title">{title}</p>

          <h2>
            {value ?? '--'}
            <span>{unit}</span>
          </h2>
        </div>

        <div className={`stat-icon ${color}`}>
          <Icon size={21} />
        </div>

      </div>

      <div className="stat-bottom">
        <span className="stat-description">{description}</span>
      </div>

    </div>

  )


  return (

    <div className="dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <Activity size={24} />
          </div>

          <div>
            <h2>CloudOS</h2>
            <span>CONTROL PANEL</span>
          </div>

        </div>


        <div className="sidebar-label">WORKSPACE</div>

        <nav className="navigation">

          {[
            { name: 'Overview', icon: LayoutDashboard },
            { name: 'Servers', icon: Server },
            { name: 'Applications', icon: Box },
            { name: 'Monitoring', icon: ChartNoAxesCombined },
            { name: 'Logs', icon: FileText },
          ].map((item) => {

            const Icon = item.icon

            return (

              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? 'active' : ''
                }`}
                onClick={() => setActivePage(item.name)}
              >

                <Icon size={19} />

                <span>{item.name}</span>

              </button>

            )

          })}

        </nav>


        <div className="sidebar-bottom">

          <button
            className={`nav-item ${
              activePage === 'Settings' ? 'active' : ''
            }`}
            onClick={() => setActivePage('Settings')}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="profile">

            <div className="profile-avatar">M</div>

            <div>
              <h4>Manash</h4>
              <span>Administrator</span>
            </div>

          </div>

        </div>

      </aside>


      {/* Main Content */}

      <main className="main-content">

        <header className="topbar">

          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">

            <div className="search-box">
              <Search size={17} />
              <input placeholder="Search..." />
            </div>

            <button className="icon-button">
              <Bell size={19} />
            </button>

            <div className="top-avatar">M</div>

          </div>

        </header>


        <section className="content">

          <div className="page-heading">

            <div>
              <p className="eyebrow">CLOUD INFRASTRUCTURE</p>

              <h1>{activePage}</h1>

              <p className="page-subtitle">
                Monitor and manage your infrastructure from one place.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={FetchMetrics}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>


          {/* Server Status */}

          <div className="server-status-card">

            <div className="server-status-left">

              <div className="server-icon">
                <Server size={23} />
              </div>

              <div>
                <h3>Ubuntu Server</h3>
                <p>Local development environment</p>
              </div>

            </div>

            <div className="server-status-right">

              <span className={`status-badge ${error ? 'offline' : ''}`}>

                {error ? (
                  <CircleAlert size={13} />
                ) : (
                  <CircleCheck size={13} />
                )}

                {loading ? 'Connecting...' : error ? 'Disconnected' : 'Connected'}

              </span>

              <span className="server-address">
                127.0.0.1:8000
              </span>

            </div>

          </div>


          {/* Statistics */}

          <div className="section-heading">

            <div>
              <h2>Server Overview</h2>
              <p>Current resource utilization</p>
            </div>

            <span className="live-indicator">
              <span></span>
              LIVE MONITORING
            </span>

          </div>


          <div className="stats-grid">

            <StatCard
              title="CPU Usage"
              value={metrics ? metrics.cpu_usage : '--'}
              unit="%"
              icon={Cpu}
              description="Processor utilization"
              color="purple"
            />

            <StatCard
              title="Memory Usage"
              value={metrics ? metrics.memory.usage_percent : '--'}
              unit="%"
              icon={Activity}
              description={
                metrics
                  ? `${metrics.memory.used_gb} GB / ${metrics.memory.total_gb} GB`
                  : 'Waiting for data'
              }
              color="blue"
            />

            <StatCard
              title="Disk Usage"
              value={metrics ? metrics.disk.usage_percent : '--'}
              unit="%"
              icon={HardDrive}
              description={
                metrics
                  ? `${metrics.disk.free_gb} GB free`
                  : 'Waiting for data'
              }
              color="orange"
            />

            <StatCard
              title="System Uptime"
              value={metrics ? formatUptime(metrics.uptime.uptime_seconds) : '--'}
              unit=""
              icon={Clock}
              description="Server running time"
              color="green"
            />

          </div>


          {/* Charts */}

          <div className="charts-grid">

            <div className="chart-card">

              <div className="chart-header">

                <div>
                  <h3>CPU Performance</h3>
                  <p>Recent processor utilization</p>
                </div>

                <div className="chart-value purple-text">
                  {metrics ? `${metrics.cpu_usage}%` : '--'}
                </div>

              </div>

              <div className="chart-container">

                <ResponsiveContainer width="100%" height="100%">

                  <AreaChart data={history}>

                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9875ff" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#9875ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#252a3a" strokeDasharray="4 4" />

                    <XAxis
                      dataKey="time"
                      stroke="#85899b"
                      tick={{ fontSize: 10 }}
                      minTickGap={25}
                    />

                    <YAxis
                      domain={[0, 100]}
                      stroke="#85899b"
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: '#171b29',
                        border: '1px solid #34394b',
                        borderRadius: '8px',
                        color: '#ffffff',
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke="#9875ff"
                      strokeWidth={2}
                      fill="url(#cpuGradient)"
                      isAnimationActive={false}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </div>


            <div className="chart-card">

              <div className="chart-header">

                <div>
                  <h3>Memory Performance</h3>
                  <p>Recent RAM utilization</p>
                </div>

                <div className="chart-value blue-text">
                  {metrics ? `${metrics.memory.usage_percent}%` : '--'}
                </div>

              </div>

              <div className="chart-container">

                <ResponsiveContainer width="100%" height="100%">

                  <AreaChart data={history}>

                    <defs>
                      <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4b9eff" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#4b9eff" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#252a3a" strokeDasharray="4 4" />

                    <XAxis
                      dataKey="time"
                      stroke="#85899b"
                      tick={{ fontSize: 10 }}
                      minTickGap={25}
                    />

                    <YAxis
                      domain={[0, 100]}
                      stroke="#85899b"
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: '#171b29',
                        border: '1px solid #34394b',
                        borderRadius: '8px',
                        color: '#ffffff',
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="ram"
                      stroke="#4b9eff"
                      strokeWidth={2}
                      fill="url(#ramGradient)"
                      isAnimationActive={false}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>


          {/* Bottom Information */}

          <div className="bottom-grid">

            <div className="info-card">

              <div className="info-heading">
                <HardDrive size={19} />
                <h3>Storage Information</h3>
              </div>

              <div className="storage-details">

                <div className="storage-numbers">
                  <strong>
                    {metrics ? `${metrics.disk.used_gb} GB` : '--'}
                  </strong>

                  <span>
                    of {metrics ? `${metrics.disk.total_gb} GB` : '--'}
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${metrics ? metrics.disk.usage_percent : 0}%`
                    }}
                  ></div>
                </div>

                <p>
                  {metrics
                    ? `${metrics.disk.free_gb} GB available`
                    : 'Waiting for server data'}
                </p>

              </div>

            </div>


            <div className="info-card">

              <div className="info-heading">
                <Wifi size={19} />
                <h3>Network Statistics</h3>
              </div>

              <div className="network-details">

                <div className="network-row">

                  <div className="network-label">
                    <ArrowUpRight size={17} />
                    <span>Data Sent</span>
                  </div>

                  <strong>
                    {metrics ? `${metrics.network.sent_mb} MB` : '--'}
                  </strong>

                </div>

                <div className="network-row">

                  <div className="network-label">
                    <ArrowDownRight size={17} />
                    <span>Data Received</span>
                  </div>

                  <strong>
                    {metrics ? `${metrics.network.received_mb} MB` : '--'}
                  </strong>

                </div>

              </div>

            </div>

          </div>


          <footer className="footer">
            <span>CloudOS © 2026</span>
            <span>Developer Infrastructure Platform</span>
          </footer>

        </section>

      </main>

    </div>

  )

}

export default App