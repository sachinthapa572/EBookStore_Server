const fruits = ["a", "b", "v", "f", "g", "r"];
const fruit = ["a", "b", "x"];

const data = fruits.filter((val) => fruit.find((idx) => idx !== val));
console.log("🚀 ~ data:", data);
