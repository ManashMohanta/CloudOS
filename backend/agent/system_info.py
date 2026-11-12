import os
import platform
import socket
import shutil


def read_memory_info():
    memory = {}

    with open("/proc/meminfo", "r") as file:
        for line in file:
            key, value = line.split(":", 1)
            memory[key] = int(value.strip().split()[0])

    total = memory["MemTotal"] / (1024 * 1024)
    available = memory["MemAvailable"] / (1024 * 1024)

    return round(total, 2), round(available, 2)


def get_system_info():
    total_ram, available_ram = read_memory_info()
    disk = shutil.disk_usage("/")

    return {
        "hostname": socket.gethostname(),
        "os": platform.system(),
        "platform": platform.platform(),
        "kernel": platform.release(),
        "cpu_cores": os.cpu_count(),
        "total_ram_gb": total_ram,
        "available_ram_gb": available_ram,
        "total_disk_gb": round(disk.total / (1024 ** 3), 2),
        "free_disk_gb": round(disk.free / (1024 ** 3), 2)
    }


if __name__ == "__main__":
    system = get_system_info()

    for key, value in system.items():
        print(f"{key}: {value}")