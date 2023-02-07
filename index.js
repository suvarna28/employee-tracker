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
{
    type: 'input',
    name: 'rolename',
    message: 'What is the name of the role?',
},
{
    type: 'input',
    name: 'rolesalary',
    message: 'What is the salary of the role?',
},
];

function init() {
    let employee = "Employee";
    let employee_ascii = asciitextgenerator(employee, "2");
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
        case 'View all employees':
            viewAllEmployees();
            break;
        case 'Add an employee':
            addEmployee();
            break;
        case 'Add a department':
            addDepartment();
            break;
        case 'Add a role':
            addRole();
            break;
        // case 'Update an employee role':
        //     palmArray(data[i].common, latinName);
        //     break;
    }
}

function viewAllEmployees() { 
    const sql = `SELECT a.id, a.first_name, a.last_name, 
                employeerole.title, department.dept_name, employeerole.salary, CONCAT(b.first_name, ' ', b.last_name) as manager
                FROM employee a
                LEFT JOIN employeerole ON a.role_id = employeerole.id
                LEFT JOIN department ON employeerole.department_id = department.id
                LEFT JOIN employee b ON a.manager_id = b.id;`;
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

function addRole() {
    let deptArray = [];
    const sql = `SELECT dept_name FROM department`;
    db.query(sql, (err, rows) => {
        if (err) throw err;
        rows.forEach(x => deptArray.push(x['dept_name']));
    });
    inquirer.prompt([
        commonQuestions[2],
        commonQuestions[3],
        {
            type: 'list',
            name: 'roledept',
            message: 'Which department does the role belong too?',
            choices: deptArray
        },
    ])
        .then((data) => {
            let sql = `INSERT INTO employeerole (title, salary) VALUES ("${data.rolename}", "${data.rolesalary}")`;
            db.query(sql, (err, rows) => {
                if (err) throw err;
            });
            console.log(`Added ${data.rolename} to the database`);
            inquirer.prompt([
                commonQuestions[0]
            ])
                .then((data) => {
                    selectChoice(data);
                });
        });
}

function addEmployee() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'employeefirstname',
            message: 'What is the employee\'s first name?'
        },
        {
            type: 'input',
            name: 'employeelastname',
            message: 'What is the employee\'s last name?'
        },
        {
            type: 'input',
            name: 'employeerole',
            message: 'What is the employee\'s role?'
        },
        {
            type: 'input',
            name: 'employeemanager',
            message: 'Who is the employee\'s manager?'
        },
    ])
        .then((data) => {
            let sql = `INSERT INTO employee (first_name, last_name) VALUES ("${data.employeefirstname}", "${data.employeefirstname}")`;
            db.query(sql, (err, rows) => {
                if (err) throw err;
            });
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


