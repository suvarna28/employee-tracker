const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const asciitextgenerator = require('ascii-text-generator');
const box = require('ascii-box').box;

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employeetracker_db'
    }
);

const commonQuestions = [{
    type: 'list',
    message: 'What would you like to do?',
    name: 'choices',
    choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department',
        'Add a role', 'Add an employee', 'Update an employee role']
},
{
    type: 'input',
    name: 'deptname',
    message: 'What is the name of the department?',
},
];

function init() { 
    let employee = "Employee";
    let employee_ascii =  asciitextgenerator(employee, "2");
    let manager = "Manager";
    let manager_ascii = asciitextgenerator(manager, "2");
    
    console.log(
        box(employee_ascii +
            manager_ascii));
    
    inquirer.prompt([
        commonQuestions[0]
    ])
        .then((data) => {
            selectChoice(data);
        });
}

function selectChoice(data) {
    switch (data.choices) {
        case 'View all departments':
            viewAllDepartments();
            break;
        case 'View all roles':
            viewAllRoles();
            break;
        // case 'View all employees':
        //     cactussucculentArray(data[i].common, latinName);
        //     break;
        // case 'Add an employee':
        //     flowerArray(data[i].common, latinName);
        //     break;
        case 'Add a department':
            addDepartment();
            break;
        // case 'Add a role':
        //     palmArray(data[i].common, latinName);
        //     break;
        // case 'Update an employee role':
        //     palmArray(data[i].common, latinName);
        //     break;
    }
}

function viewAllDepartments() {
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, rows) => {
        if (err) throw err;
        const table = cTable.getTable(rows);
        console.log(table);
        inquirer.prompt([
            commonQuestions[0]
        ])
            .then((data) => {
                selectChoice(data);
            });
    });
}

function viewAllRoles() {
    const sql = `SELECT employeerole.id, employeerole.title, department.dept_name, employeerole.salary
                FROM employeerole
                JOIN department ON employeerole.department_id = department.id`;
    db.query(sql, (err, rows) => {
        if (err) throw err;
        const table = cTable.getTable(rows);
        console.log(table);
        inquirer.prompt([
            commonQuestions[0]
        ])
            .then((data) => {
                selectChoice(data);
            });
    });
}

function addDepartment() {
    inquirer.prompt([
        commonQuestions[1]
    ])
        .then((data) => {
            let sql = `INSERT INTO department (dept_name) VALUES ("${data.deptname}")`;
            db.query(sql, (err, rows) => {
                if (err) throw err;
            });
            console.log(`Added ${data.deptname} to the database`);
            inquirer.prompt([
                commonQuestions[0]
            ])
                .then((data) => {
                    selectChoice(data);
                });
        });
}

// Function call that initializes the app
init();


