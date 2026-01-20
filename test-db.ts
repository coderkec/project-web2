import mysql from "mysql2/promise";

async function test() {
    const urls = [
        "mysql://root:admin123@localhost:3306",
        "mysql://root:@localhost:3306",
        "mysql://root:1234@localhost:3306",
        "mysql://root:root@localhost:3306"
    ];

    for (const url of urls) {
        try {
            console.log(`Testing ${url}...`);
            const conn = await mysql.createConnection(url);
            console.log(`Successfully connected to ${url}!`);
            await conn.query("CREATE DATABASE IF NOT EXISTS integrated_dashboard");
            console.log("Database 'integrated_dashboard' ensured.");
            await conn.end();
            process.exit(0);
        } catch (e: any) {
            console.error(`Failed ${url}: ${e.message}`);
        }
    }
}

test();
