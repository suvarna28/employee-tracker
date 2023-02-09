// Require all the packages
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const asciitextgenerator = require('ascii-text-generator');
const { first } = require('rxjs');
const box = require('ascii-box').box;

// Connect to employee tracker database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employeetracker_db'
    }
);

// Main menu question 
const menuQuestion = [{
    type: 'list',
    message: 'What would you like to do?',
    name: 'choices',
    choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department',
        'Add a role', 'Add an employee', 'Update an employee role', 'Total utilized budget of a department',
        'View employees by department']
}
];

// Function that displays the name of the application and main menu question
function init() {
    let employee = "Employee";
    let employee_ascii = asciitextgenerator(employee, "2");
    let manager = "Manager";
    let manager_ascii = asciitextgenerator(manager, "2");

    console.log(
        box(employee_ascii +
            manager_ascii));

    inquirer.prompt([
        menuQuestion[0]
    ])
        .then((data) => {
            selectChoice(data);
        });
}

// Function that calls other functions based on users' choice from the main menu 
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
            updateEmployeeRole();
            break;
        case 'Total utilized budget of a department':
            totalBudgetOfDept();
            break;
        case 'View employees by department':
            viewEmployeesByDept();
            break;
    }
}

// Function that display all the existing employees in the employee database
function viewAllEmployees() {
    const sql = `SELECT a.id, a.first_name, a.last_name, 
                employeerole.title, department.dept_name, employeerole.salary, CONCAT(b.first_name, ' ', b.last_name) as manager
                FROM employee a
                LEFT JOIN employeerole ON a.role_id = employeerole.id
                LEFT JOIN department ON employeerole.department_id = department.id
                LEFT JOIN employee b ON a.manager_id = b.id;`;
    db.promise().query(sql)
        .then(([rows]) => {
            const table = cTable.getTable(rows);
            console.log(table);
            inquirer.prompt([
                menuQuestion[0]
            ])
                .then((data) => {
                    selectChoice(data);
                });

        });
}

// Function that display all the existing departments in the employee database
function viewAllDepartments() {
    const sql = `SELECT * FROM department`;
    db.promise().query(sql)
        .then(([rows]) => {
            const table = cTable.getTable(rows);
            console.log(table);
            inquirer.prompt([
                menuQuestion[0]
            ])
                .then((data) => {
                    selectChoice(data);
                });
        });
}

// Function to add a department in the employee database based on users' answers 
// to the questions listed in the inquirer.prompt
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
            db.promise().query(sql)
                .then(([rows]) => {
                    console.log(`Added ${data.deptname} to the database`);
                    inquirer.prompt([
                        menuQuestion[0]
                    ])
                        .then((data) => {
                            selectChoice(data);
                        });

                });
        });
}

// Function that display all the existing employee roles in the employee database
function viewAllRoles() {
    const sql = `SELECT employeerole.id, employeerole.title, department.dept_name, employeerole.salary
                FROM employeerole
                JOIN department ON employeerole.department_id = department.id`;
    db.promise().query(sql)
        .then(([rows]) => {
            const table = cTable.getTable(rows);
            console.log(table);
            inquirer.prompt([
                menuQuestion[0]
            ])
                .then((data) => {
                    selectChoice(data);
                });
        });
}

// Function to add a role in the employee database based on users' answers 
// to the questions listed in the inquirer.prompt
function addRole() {
    let deptArray = [];
    const sql = `SELECT dept_name FROM department`;
    db.promise().query(sql)
        .then(([rows]) => {
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
            db.promise().query(sql1)
                .then(([rows]) => {
                    rows.forEach(x => {
                        if (data.roledept === x['dept_name']) {
                            departmentId = parseInt(x['id']);
                        }
                    });
                    let sql = `INSERT INTO employeerole (title, salary, department_id) VALUES ("${data.rolename}", "${data.rolesalary}", ${departmentId})`;
                    db.promise().query(sql)
                        .then(([rows]) => {
                        });
                    console.log(`Added ${data.rolename} to the database`);
                    inquirer.prompt([
                        menuQuestion[0]
                    ])
                        .then((data) => {
                            selectChoice(data);
                        });
                });
        });
}

// Function to add an employee in the employee database based on users' answers 
// to the questions listed in the inquirer.prompt
function addEmployee() {
    let managerArray = ["None"];
    let roleArray = [];
    const sql = `SELECT CONCAT(first_name,' ', last_name) as manager FROM employee`;
    db.promise().query(sql)
        .then(([rows]) => {
            rows.forEach(x => managerArray.push(x['manager']));
        });
    const sql1 = `SELECT title FROM employeerole`;
    db.promise().query(sql1)
        .then(([rows]) => {
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
            db.promise().query(sql)
                .then(([rows]) => {
                    rows.forEach(x => { roleId = parseInt(x['id']) });
                    const sql1 = `SELECT id FROM employee 
                            WHERE CONCAT(first_name, ' ',  last_name) = "${data.employeemanager}"`;
                    let employeeId;
                    db.promise().query(sql1)
                        .then(([rows]) => {
                            if (data.employeemanager === "None") {
                                employeeId = null;
                            } else {
                                rows.forEach(x => employeeId = parseInt(x['id']));
                            }
                            let sql2 = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES ("${data.employeefirstname}", "${data.employeelastname}", ${roleId}, ${employeeId})`;
                            db.promise().query(sql2)
                                .then(([rows]) => {
                                });
                            console.log(`Added ${data.employeefirstname} ${data.employeelastname} to the database`);
                            inquirer.prompt([
                                menuQuestion[0]
                            ])
                                .then((data) => {
                                    selectChoice(data);
                                });
                        });
                });
        });
}

// Function to update an employee role based on users' answers 
// to the questions listed in the inquirer.prompt
function updateEmployeeRole() {
    let employeeArray = [];
    let roleArray = [];
    const sql = `SELECT CONCAT(first_name,' ', last_name) as employee FROM employee`;
    db.promise().query(sql)
        .then(([rows]) => {
            rows.forEach(x => employeeArray.push(x['employee']));
            const sql1 = `SELECT title FROM employeerole`;
            db.promise().query(sql1)
                .then(([rows]) => {
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
                            let firstName = data.selectedemployee.split(" ")[0];
                            let lastName = data.selectedemployee.split(" ")[1];
                            const sql = `SELECT id, title FROM employeerole`;
                            db.promise().query(sql)
                                .then(([rows]) => {
                                    rows.forEach(x => {
                                        if (data.selectedrole === x['title']) {
                                            roleID = parseInt(x['id']);
                                        }
                                    });
                                    const sql1 = `UPDATE employee SET role_id = ${roleID}
                                    WHERE first_name = "${firstName}" AND last_name = "${lastName}"`;
                                    db.promise().query(sql1)
                                        .then(([rows]) => {
                                        });
                                    console.log("Updated employee's role");
                                    inquirer.prompt([
                                        menuQuestion[0]
                                    ])
                                        .then((data) => {
                                            selectChoice(data);
                                        });
                                });
                        });
                });
        });
}

//Function that displays total utilized budget of a department—in other words, 
//the combined salaries of all the employees in that department.
function totalBudgetOfDept() {
    let deptArray = [];
    const sql = `SELECT dept_name FROM department`;
    db.promise().query(sql)
        .then(([rows]) => {
            rows.forEach(x => deptArray.push(x['dept_name']));
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'dept',
                    message: 'Select the department to view total budget?',
                    choices: deptArray
                },
            ])
                .then((data) => {
                    const sql1 = `SELECT sum(employeerole.salary) as total
                    FROM employee
                    JOIN employeerole ON employee.role_id = employeerole.id
                    JOIN department ON employeerole.department_id = department.id
                    GROUP BY "${data.dept}"`;
                    db.promise().query(sql1)
                        .then(([rows]) => {
                            console.log(`Total budget of ${data.dept} department is ${rows[0]['total']}`);
                            inquirer.prompt([
                                menuQuestion[0]
                            ])
                                .then((data) => {
                                    selectChoice(data);
                                });
                        });
                });
        });
}

//Function to view employees by department
function viewEmployeesByDept() {
    let deptArray = [];
    const sql = `SELECT dept_name FROM department`;
    db.promise().query(sql)
        .then(([rows]) => {
            rows.forEach(x => deptArray.push(x['dept_name']));
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'dept',
                    message: 'Select the department to view total budget?',
                    choices: deptArray
                },
            ])
                .then((data) => {
                const sql1 = `SELECT department.dept_name, CONCAT(employee.first_name, ' ', employee.last_name) as employee
                            FROM employee
                            JOIN employeerole ON employee.role_id = employeerole.id
                            JOIN department ON employeerole.department_id = department.id
                            where department.dept_name = "${data.dept}"`;
                            db.promise().query(sql1)
                            .then(([rows]) => {
                                const table = cTable.getTable(rows);
                                console.log(table);
                                inquirer.prompt([
                                    menuQuestion[0]
                                ])
                                    .then((data) => {
                                        selectChoice(data);
                                    });
                            });
                });
        });
}

// Function call that initializes the app
init();


