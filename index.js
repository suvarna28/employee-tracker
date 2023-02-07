const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const asciitextgenerator = require('ascii-text-generator');
const { first } = require('rxjs');
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
}
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

// add a role, add an employee, and update an employee role

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
        case 'Update an employee role':
            updateEmployee();
            break;
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
        {
            type: 'input',
            name: 'deptname',
            message: 'What is the name of the department?',
        }
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
        {
            type: 'list',
            name: 'roledept',
            message: 'Which department does the role belong too?',
            choices: deptArray
        },
    ])
        .then((data) => {
            const sql1 = `SELECT * FROM department`;
            let departmentId;
            db.query(sql1, (err, rows) => {
                if (err) throw err;
                rows.forEach(x => {
                    if (data.roledept === x['dept_name']) {
                        departmentId = parseInt(x['id']);
                    }
                });
                let sql = `INSERT INTO employeerole (title, salary, department_id) VALUES ("${data.rolename}", "${data.rolesalary}", ${departmentId})`;
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
        });
}

function addEmployee() {
    let managerArray = ["None"];
    let roleArray = [];
    const sql = `SELECT CONCAT(first_name,' ', last_name) as manager FROM employee`;
    db.query(sql, (err, rows) => {
        if (err) throw err;
        rows.forEach(x => managerArray.push(x['manager']));
    });
    const sql1 = `SELECT title FROM employeerole`;
    db.query(sql1, (err, rows) => {
        if (err) throw err;
        rows.forEach(x => roleArray.push(x['title']));
    });
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
            type: 'list',
            name: 'employeerole',
            message: 'What is the employee\'s role?',
            choices: roleArray
        },
        {
            type: 'list',
            name: 'employeemanager',
            message: 'Who is the employee\'s manager?',
            choices: managerArray
        },
    ])
        .then((data) => {
            const sql = `SELECT id FROM employeerole
            WHERE title = "${data.employeerole}"`;
            let roleId;
            db.query(sql, (err, rows) => {
                if (err) throw err;
                rows.forEach(x => { roleId = parseInt(x['id']) });
                const sql1 = `SELECT id FROM employee 
                            WHERE CONCAT(first_name, ' ',  last_name) = "${data.employeemanager}"`;
                let employeeId;
                db.query(sql1, (err, rows) => {
                    if (err) throw err;
                    if (data.employeemanager === "None") {
                        employeeId = null;
                    } else {
                        rows.forEach(x => employeeId = parseInt(x['id']));
                    }
                    let sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES ("${data.employeefirstname}", "${data.employeelastname}", ${roleId}, ${employeeId})`;
                    db.query(sql, (err, rows) => {
                        if (err) throw err;
                    });
                    console.log(`Added ${data.employeefirstname} ${data.employeelastname} to the database`);
                    inquirer.prompt([
                        commonQuestions[0]
                    ])
                        .then((data) => {
                            selectChoice(data);
                        });
                });
            });
        });
}

function updateEmployee() {
    let employeeArray = [];
    let roleArray = [];
    const sql = `SELECT CONCAT(first_name,' ', last_name) as employee FROM employee`;
    db.query(sql, (err, rows) => {
        if (err) throw err;
        rows.forEach(x => employeeArray.push(x['employee']));
        const sql1 = `SELECT title FROM employeerole`;
        db.query(sql1, (err, rows) => {
            if (err) throw err;
            rows.forEach(x => roleArray.push(x['title']));
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'selectedemployee',
                    message: 'Which employee\'s role do you want to update?',
                    choices: employeeArray
                },
                {
                    type: 'list',
                    name: 'selectedrole',
                    message: 'Which role do you want to assign the selected employee?',
                    choices: roleArray
                },
            ])
                .then((data) => {
                    let roleID;
                    let firstName;
                    let lastName;
                    const sql = `SELECT id, title FROM employeerole`;
                    db.query(sql, (err, rows) => {
                        if (err) throw err;
                        rows.forEach(x => {
                            if (data.selectedrole === x['title']) {
                                roleID = parseInt(x['id']);
                            }
                            firstName = data.selectedemployee.split(" ")[0];
                            lastName = data.selectedemployee.split(" ")[1];
                        });
                        const sql1 = `UPDATE employee SET role_id = ${roleID}
                                    WHERE first_name = "${firstName}" AND last_name = "${lastName}"`;
                        db.query(sql1, (err, rows) => {
                            if (err) throw err;
                        });
                        console.log("Updated employee's role");
                        inquirer.prompt([
                            commonQuestions[0]
                        ])
                            .then((data) => {
                                selectChoice(data);
                            });
                    });
                });
        });
    });
}

// Function call that initializes the app
init();


