import socket
from datetime import datetime, timezone


def CheckServerHealth(host, port, timeout=3):

    result = {
        "host": host,
        "port": port,
        "status": "Unknown",
        "checked_at": datetime.now(timezone.utc).isoformat()
    }

    try:
        with socket.create_connection((host, port), timeout=timeout):
            result["status"] = "Online"

    except (socket.timeout, OSError):
        result["status"] = "Offline"

    return result
