import psutil
import time


# Get CPU Usage
def GetCPUUsage():
    return psutil.cpu_percent(interval=1)


# Get RAM Usage
def GetMemoryUsage():
    memory = psutil.virtual_memory()

    return {
        "total_gb": round(memory.total / (1024 ** 3), 2),
        "used_gb": round(memory.used / (1024 ** 3), 2),
        "available_gb": round(memory.available / (1024 ** 3), 2),
        "usage_percent": memory.percent
    }


# Get Disk Usage
def GetDiskUsage():
    disk = psutil.disk_usage("/")

    return {
        "total_gb": round(disk.total / (1024 ** 3), 2),
        "used_gb": round(disk.used / (1024 ** 3), 2),
        "free_gb": round(disk.free / (1024 ** 3), 2),
        "usage_percent": disk.percent
    }


# Get Network Statistics
def GetNetworkStats():
    network = psutil.net_io_counters()

    return {
        "sent_mb": round(network.bytes_sent / (1024 ** 2), 2),
        "received_mb": round(network.bytes_recv / (1024 ** 2), 2)
    }


# Get System Uptime
def GetUptime():
    uptime = time.time() - psutil.boot_time()

    return {
        "uptime_seconds": round(uptime),
        "uptime_hours": round(uptime / 3600, 2)
    }


# Collect All Metrics
def GetSystemMetrics():

    metrics = {
        "cpu_usage": GetCPUUsage(),
        "memory": GetMemoryUsage(),
        "disk": GetDiskUsage(),
        "network": GetNetworkStats(),
        "uptime": GetUptime()
    }

    return metrics


# Main Program
if __name__ == "__main__":

    import json

    data = GetSystemMetrics()

    print(json.dumps(data, indent=4))