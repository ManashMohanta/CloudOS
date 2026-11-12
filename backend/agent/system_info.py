import os
import platform
import socket
import shutil
import json
from pathlib import Path


# Read RAM information from Linux
def read_memory_info():
    memory = {}

    with open("/proc/meminfo", "r") as file:
        for line in file:
            key, value = line.split(":", 1)
            memory[key] = int(value.strip().split()[0])

    total = memory["MemTotal"] / (1024 * 1024)
    available = memory["MemAvailable"] / (1024 * 1024)

    return round(total, 2), round(available, 2)


# Collect system information
def get_system_info():

    total_ram, available_ram = read_memory_info()

    disk = shutil.disk_usage("/")

    system_info = {
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

    return system_info


# Read saved system information
def load_system_info(file_path):

    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data


# Main program
if __name__ == "__main__":

    system = get_system_info()

    output_file = Path(__file__).with_name("system_info.json")

    # Save system information
    with output_file.open("w", encoding="utf-8") as file:
        json.dump(system, file, indent=4)

    print("System information saved successfully!")
    print(f"File location: {output_file}")

    # Read saved information
    saved_data = load_system_info(output_file)

    print("\nVerified System Information:")
    print("Hostname:", saved_data["hostname"])
    print("Operating System:", saved_data["os"])
    print("CPU Cores:", saved_data["cpu_cores"])