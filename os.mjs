import os from "os";
const getNetworkIpAddress = () => {
  const networkInterfaces = os.networkInterfaces();

  const connectedNetworkInterface = Object.values(networkInterfaces)
    .flatMap((iface) => iface)
    .find((iface) => iface.family === "IPv4");

  console.log(connectedNetworkInterface);
  if (connectedNetworkInterface) {
    return connectedNetworkInterface.address;
  }
};

getNetworkIpAddress();

((first, second) => {
  console.log(first + second);
})(2, 3);
