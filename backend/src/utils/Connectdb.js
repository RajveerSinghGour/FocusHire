const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

async function ConnectDb(){
    try {
         await mongoose.connect(process.env.MONGODB_URI);
        // Log useful connection info (non-sensitive)
        const host = mongoose.connection.host || 'unknown-host';
        const name = mongoose.connection.name || 'unknown-db';
        const state = mongoose.connection.readyState; // 1 = connected
        console.log(`connect to db - host: ${host}, db: ${name}, readyState: ${state}`);
    } catch (error) {
        // Provide clearer guidance for DNS SRV lookup failures (common with `mongodb+srv`)
        console.error("some error ", error);
        if (error && error.code === 'ENOTFOUND' && /_mongodb\._tcp/.test(error.hostname || '')) {
            console.error('\nDetected DNS SRV lookup failure for MongoDB Atlas (ENOTFOUND).');
            console.error('Possible causes: this machine cannot resolve SRV records, or your network blocks DNS lookups for Atlas.');
            console.error('Workarounds:');
            console.error("  1) Use the non-SRV connection string from Atlas (replace 'mongodb+srv://...' with 'mongodb://<host1>,<host2>/<dbname>?replicaSet=...' or use the connection string shown under 'Standard connection string (SRV)' -> 'Short SRV connection string' and choose the 'Standard connection string' option).");
            console.error("  2) Ensure your DNS resolver is working (try 'nslookup cluster0.jqp40zq.mongodb.net' or change DNS to 8.8.8.8 temporarily).");
            console.error("  3) Run the node process on a network that allows Atlas SRV lookups (e.g., your home/work internet or a cloud VM).");
            console.error('\nExample non-SRV style (replace placeholders):');
            console.error("  mongodb://username:password@host1:27017,host2:27017,host3:27017/dbname?replicaSet=atlas-xxxxx&ssl=true&authSource=admin&retryWrites=true&w=majority");
        }
        // Exit so that a supervisor (PM2/systemd) can restart or the developer notices the failure.
        process.exit(1);
    }
}

module.exports = ConnectDb;
