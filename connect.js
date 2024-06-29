const mongoose = require('mongoose');

const MONGO_URL = 'mongodb://user:pass@127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/naxx?replicaSet=rs1'
async function initMongodb() {
  mongoose.Promise = global.Promise;
  const res = await mongoose.connect(MONGO_URL).catch(error => {
    console.log(error);
  })
  console.info(`Mongodb Initialized`);
}

initMongodb()