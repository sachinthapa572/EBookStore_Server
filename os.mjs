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

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  displayInfo() {
    console.log(`Name: ${this.name}, Age: ${this.age}`);
  }

  static compareAges(person1, person2) {
    return person1.age - person2.age;
  }

  static createAndDisplay(name, age) {
    const newPerson = new Person(name, age);
    newPerson.displayInfo();
    return newPerson;
  }
}
