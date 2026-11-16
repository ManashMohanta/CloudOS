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
  Plus,
  Trash2,
  X,
  Pencil,
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

  // Server Management States
  const [servers, setServers] = useState([])
  const [serverLoading, setServerLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [selectedServer, setSelectedServer] = useState(null)

  // Stores the ID of the server being edited.
  // Null means we are adding a new server.
  const [editingServerId, setEditingServerId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 22,
    environment: 'Development',
  })


  // Fetch System Metrics
  async function FetchMetrics() {

    try {

      const response = await fetch('/api/metrics/')

      if (!response.ok) {
        throw new Error('Metrics API request failed')
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


  // Fetch Registered Servers
  async function FetchServers() {

    setServerLoading(true)
    setServerError('')

    try {

      const response = await fetch('/api/servers/')

      if (!response.ok) {
        throw new Error('Unable to fetch servers')
      }

      const data = await response.json()

      setServers(data)

    } catch (err) {

      console.error('Server API error:', err)
      setServerError('Unable to load servers. Check Django backend.')

    } finally {

      setServerLoading(false)

    }

  }


  // Automatically Refresh Metrics
  useEffect(() => {

    FetchMetrics()

    const interval = setInterval(FetchMetrics, 5000)

    return () => clearInterval(interval)

  }, [])


  // Fetch Servers When Servers Page Opens
  useEffect(() => {

    if (activePage === 'Servers') {
      FetchServers()
    }

  }, [activePage])


  // Handle Form Input
  function HandleInput(event) {

    const { name, value } = event.target

    setFormData(previous => ({
      ...previous,
      [name]: value,
    }))

  }


  // Reset Form
  function ResetForm() {

    setFormData({
      name: '',
      host: '',
      port: 22,
      environment: 'Development',
    })

    setEditingServerId(null)
    setShowForm(false)

  }


  // Open Add Server Form
  function OpenAddForm() {

    setFormData({
      name: '',
      host: '',
      port: 22,
      environment: 'Development',
    })

    setEditingServerId(null)
    setServerError('')
    setShowForm(true)

  }


  // Open Edit Server Form
  function EditServer(server) {

    setFormData({
      name: server.name,
      host: server.host,
      port: server.port,
      environment: server.environment,
    })

    setEditingServerId(server.id)
    setServerError('')
    setShowForm(true)

  }


  // Add or Update Server
  async function SaveServer(event) {

    event.preventDefault()

    setServerError('')

    const isEditing = editingServerId !== null

    const url = isEditing
      ? `/api/servers/${editingServerId}/`
      : '/api/servers/'

    const method = isEditing ? 'PUT' : 'POST'

    try {

      const response = await fetch(url, {

        method: method,

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          ...formData,
          port: Number(formData.port),
        }),

      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(JSON.stringify(data))
      }

      if (isEditing) {

        // Update existing server in React state
        setServers(previous =>
          previous.map(server =>
            server.id === data.id ? data : server
          )
        )

        // Update currently selected server details
        setSelectedServer(previous =>
          previous?.id === data.id ? data : previous
        )

      } else {

        // Add new server to the list
        setServers(previous => [data, ...previous])

      }

      ResetForm()

    } catch (err) {

      console.error('Server save error:', err)

      setServerError(
        isEditing
          ? 'Server update failed. Check the entered details.'
          : 'Server registration failed. Check the entered details.'
      )

    }

  }


  // Delete Server
  async function DeleteServer(id) {

    const confirmed = window.confirm(
      'Are you sure you want to delete this server?'
    )

    if (!confirmed) return

    try {

      const response = await fetch(`/api/servers/${id}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Delete request failed')
      }

      setServers(previous =>
        previous.filter(server => server.id !== id)
      )

      if (selectedServer?.id === id) {
        setSelectedServer(null)
      }

    } catch (err) {

      console.error('Delete server error:', err)

      setServerError('Unable to delete server.')

    }

  }


  // Format Uptime
  const formatUptime = (seconds) => {

    if (seconds === undefined) return '--'

    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${days}d ${hours}h ${minutes}m`

  }


  // Statistics Card
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
              <h4>Administrator</h4>
              <span>CloudOS User</span>
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


          {/* SERVERS MANAGEMENT PAGE */}

          {activePage === 'Servers' ? (

            <>

              <div className="page-heading">

                <div>
                  <p className="eyebrow">CLOUD INFRASTRUCTURE</p>

                  <h1>Server Management</h1>

                  <p className="page-subtitle">
                    Register and manage your infrastructure servers.
                  </p>
                </div>

                <button
                  className="add-server-button"
                  onClick={OpenAddForm}
                >
                  <Plus size={17} />
                  Add Server
                </button>

              </div>


              {/* Server Summary */}

              <div className="server-summary">

                <div className="summary-icon">
                  <Server size={23} />
                </div>

                <div>
                  <h2>{servers.length}</h2>
                  <p>Registered Servers</p>
                </div>

              </div>


              {/* Error Message */}

              {serverError && (

                <div className="error-message">
                  {serverError}
                </div>

              )}


              {/* Add / Edit Server Form */}

              {showForm && (

                <div className="server-form-card">

                  <div className="form-heading">

                    <div>
                      <h2>
                        {editingServerId !== null
                          ? 'Edit Server'
                          : 'Register New Server'}
                      </h2>

                      <p>
                        {editingServerId !== null
                          ? 'Update the server information below.'
                          : 'Enter the server information below.'}
                      </p>
                    </div>

                    <button
                      className="close-form-button"
                      onClick={ResetForm}
                    >
                      <X size={20} />
                    </button>

                  </div>


                  <form onSubmit={SaveServer}>

                    <div className="form-grid">

                      <div className="form-group">

                        <label>Server Name</label>

                        <input
                          type="text"
                          name="name"
                          placeholder="Example: Ubuntu Server"
                          value={formData.name}
                          onChange={HandleInput}
                          required
                        />

                      </div>


                      <div className="form-group">

                        <label>IP Address / Hostname</label>

                        <input
                          type="text"
                          name="host"
                          placeholder="Example: 192.168.1.10"
                          value={formData.host}
                          onChange={HandleInput}
                          required
                        />

                      </div>


                      <div className="form-group">

                        <label>Port Number</label>

                        <input
                          type="number"
                          name="port"
                          min="1"
                          max="65535"
                          value={formData.port}
                          onChange={HandleInput}
                          required
                        />

                      </div>


                      <div className="form-group">

                        <label>Environment</label>

                        <select
                          name="environment"
                          value={formData.environment}
                          onChange={HandleInput}
                        >

                          <option value="Development">Development</option>
                          <option value="Staging">Staging</option>
                          <option value="Production">Production</option>

                        </select>

                      </div>

                    </div>


                    <div className="form-actions">

                      <button
                        type="button"
                        className="cancel-button"
                        onClick={ResetForm}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="submit-server-button"
                      >
                        {editingServerId !== null
                          ? 'Update Server'
                          : 'Register Server'}
                      </button>

                    </div>

                  </form>

                </div>

              )}


              {/* Registered Servers Table */}

              <div className="servers-table-card">

                <div className="table-heading">

                  <div>
                    <h2>Registered Servers</h2>
                    <p>Server inventory stored in CloudOS.</p>
                  </div>

                  <button
                    className="table-refresh-button"
                    onClick={FetchServers}
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>

                </div>


                {serverLoading ? (

                  <div className="empty-state">
                    Loading servers...
                  </div>

                ) : servers.length === 0 ? (

                  <div className="empty-state">
                    <Server size={35} />

                    <h3>No Servers Registered</h3>

                    <p>Add your first server to CloudOS.</p>
                  </div>

                ) : (

                  <div className="table-wrapper">

                    <table className="servers-table">

                      <thead>

                        <tr>
                          <th>SERVER</th>
                          <th>HOST</th>
                          <th>PORT</th>
                          <th>ENVIRONMENT</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>

                      </thead>


                      <tbody>

                        {servers.map(server => (

                          <tr key={server.id}>

                            <td>
                              <div className="server-name-cell">
                                <Server size={17} />
                                <strong>{server.name}</strong>
                              </div>
                            </td>

                            <td>{server.host}</td>

                            <td>{server.port}</td>

                            <td>
                              <span className="environment-badge">
                                {server.environment}
                              </span>
                            </td>

                            <td>
                              <span className="registered-badge">
                                <CircleCheck size={13} />
                                Registered
                              </span>
                            </td>

                            <td>

                              <div className="server-actions">

                                <button
                                  className="view-server-button"
                                  onClick={() => setSelectedServer(server)}
                                >
                                  Details
                                </button>

                                <button
                                  className="view-server-button"
                                  onClick={() => EditServer(server)}
                                  title="Edit Server"
                                >
                                  <Pencil size={14} />
                                  Edit
                                </button>

                                <button
                                  className="delete-server-button"
                                  onClick={() => DeleteServer(server.id)}
                                  title="Delete Server"
                                >
                                  <Trash2 size={16} />
                                </button>

                              </div>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>


              {/* Server Details */}

              {selectedServer && (

                <div className="server-details-card">

                  <div className="form-heading">

                    <div>
                      <h2>Server Details</h2>
                      <p>Registered server information.</p>
                    </div>

                    <button
                      className="close-form-button"
                      onClick={() => setSelectedServer(null)}
                    >
                      <X size={20} />
                    </button>

                  </div>

                  <div className="details-grid">

                    <div>
                      <span>Server ID</span>
                      <strong>{selectedServer.id}</strong>
                    </div>

                    <div>
                      <span>Server Name</span>
                      <strong>{selectedServer.name}</strong>
                    </div>

                    <div>
                      <span>Host</span>
                      <strong>{selectedServer.host}</strong>
                    </div>

                    <div>
                      <span>Port</span>
                      <strong>{selectedServer.port}</strong>
                    </div>

                    <div>
                      <span>Environment</span>
                      <strong>{selectedServer.environment}</strong>
                    </div>

                    <div>
                      <span>Registered At</span>
                      <strong>
                        {new Date(selectedServer.created_at).toLocaleString()}
                      </strong>
                    </div>

                  </div>

                </div>

              )}

            </>


          ) : activePage === 'Overview' ? (

            <>

              <div className="page-heading">

                <div>
                  <p className="eyebrow">CLOUD INFRASTRUCTURE</p>

                  <h1>Overview</h1>

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

                    {loading
                      ? 'Connecting...'
                      : error
                        ? 'Disconnected'
                        : 'Connected'}

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
                  value={
                    metrics
                      ? formatUptime(metrics.uptime.uptime_seconds)
                      : '--'
                  }
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
                          <linearGradient
                            id="cpuGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
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

                        <Tooltip />

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
                          <linearGradient
                            id="ramGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
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

                        <Tooltip />

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


              {/* Storage and Network */}

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
                          width: `${metrics ? metrics.disk.usage_percent : 0}%`,
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

            </>


          ) : (

            <div className="placeholder-page">

              <h2>{activePage}</h2>

              <p>
                This CloudOS module is planned for a future development stage.
              </p>

            </div>

          )}


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