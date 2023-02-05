const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employeetracker_db'
    },
    console.log(`Connected to the employeetracker_db database.`)
);

const commonQuestions = [{
    type: 'list',
    message: 'What would you like to do?',
    name: 'choices',
    choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department',
        'Add a role', 'Add an employee', 'Update an employee role']
}];

function init() {
    inquirer.prompt([
        commonQuestions[0]
    ])
        .then((data) => {
            console.log("Here !!!!" + data);
            if (data.choices === 'View all employees') {
                const sql = `SELECT * FROM employee`;
                db.query(sql, (err, rows) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    const table = cTable.getTable(rows);
                    console.log(table);
                });
            }
        });
}

// Function call that initializes the app
init();


