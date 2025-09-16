import os from "node:os";
import { appEnv } from "@/config/env";

export type HealthData = {
  getSystemHealth: () => {
    cpuUsage: number[];
    totalMemory: string;
    freeMemory: string;
  };
  getApplicationHealth: () => {
    environment: string;
    uptime: string;
    memoryUsage: {
      heapTotal: string;
      heapUsed: string;
    };
  };
  formatMemory: (bytes: number) => string;
};

export const quicker: Omit<HealthData, "formatMemory"> = {
  getSystemHealth: () => {
    return {
      cpuUsage: os.loadavg(),
      totalMemory: formatMemory(os.totalmem()),
      freeMemory: formatMemory(os.freemem()),
    };
  },
  getApplicationHealth: () => {
    const formatUptime = (seconds: number) => {
      const minutes = seconds / 60;
      return minutes >= 1 ? `${minutes.toFixed(2)} Minute` : `${seconds.toFixed(2)} Second`;
    };

    return {
      environment: appEnv.NODE_ENV,
      uptime: formatUptime(process.uptime()),
      memoryUsage: {
        heapTotal: formatMemory(process.memoryUsage().heapTotal),
        heapUsed: formatMemory(process.memoryUsage().heapUsed),
      },
    };
  },
};

const formatMemory: HealthData["formatMemory"] = (bytes: number): string => {
  const gb = bytes / 1024 / 1024 / 1024;
  return gb >= 1 ? `${gb.toFixed(2)} GB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};
