const fs = require('fs');
const path = require('path');
const { Pool } = require('pg'); 
const csv = require('csv-parser'); 


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'HR',
    password: 'utm123',
    port: 5432,
});


const uploadCSV = (req, res) => {
    const filePath = path.join(__dirname, '../tmp', req.file.filename);
    const tableName = 'employees'; 

    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                for (const row of results) {
                    await pool.query(
                        `INSERT INTO ${tableName} (first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                        [
                            row.first_name,
                            row.last_name,
                            row.email,
                            row.phone_number,
                            row.hire_date,
                            row.job_id,
                            row.salary,
                            row.commission_pct,
                            row.manager_id,
                            row.department_id
                        ]
                    );
                }
                res.status(200).send('Archivo subido y datos guardados en la base de datos con éxito');
            } catch (error) {
                console.error(error);
                res.status(500).send('Error al guardar los datos en la base de datos');
            } finally {
                fs.unlinkSync(filePath); 
            }
        });
};


const exportCSV = async (req, res) => {
    const tableName = 'employees'; 
    const filePath = path.join(__dirname, '../tmp', 'exported_data.csv');

    const client = await pool.connect();
    const writer = fs.createWriteStream(filePath);

    try {
        const result = await client.query(`SELECT * FROM ${tableName}`);
        writer.write('first_name,last_name,email,phone_number,hire_date,job_id,salary,commission_pct,manager_id,department_id\n');
        
        result.rows.forEach(row => {
            writer.write(`${row.first_name},${row.last_name},${row.email},${row.phone_number},${row.hire_date},${row.job_id},${row.salary},${row.commission_pct},${row.manager_id},${row.department_id}\n`);
        });

        writer.end();
        writer.on('finish', () => {
            res.download(filePath, 'exported_data.csv', (err) => {
                if (err) {
                    console.error(err);
                }
                fs.unlinkSync(filePath); 
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al exportar los datos');
    } finally {
        client.release();
    }
};

module.exports = { uploadCSV, exportCSV };

