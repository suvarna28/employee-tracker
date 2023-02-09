USE employeetracker_db;

--View all departments
SELECT * FROM department

--View all roles
SELECT employeerole.id, employeerole.title, department.dept_name, employeerole.salary
FROM employeerole
JOIN department ON employeerole.department_id = department.id;

--View all employees
SELECT a.id, a.first_name, a.last_name, 
employeerole.title, department.dept_name, employeerole.salary, CONCAT(b.first_name, ' ', b.last_name) as manager
FROM employee a
LEFT JOIN employeerole ON a.role_id = employeerole.id
LEFT JOIN department ON employeerole.department_id = department.id
LEFT JOIN employee b ON a.manager_id = b.id;

--Add a department
INSERT INTO department (dept_name) VALUES (?)

--Add a role
INSERT INTO employeerole (title, salary, department_id) VALUES (?, ?, ?)

--Add an employee 
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)

--Update an employee
UPDATE employee SET role_id = ${roleID} WHERE first_name = " " AND last_name = " "

--Total utilized budget of a department—in other words, 
--the combined salaries of all employees in that department.
SELECT sum(employeerole.salary)
FROM employee
JOIN employeerole ON employee.role_id = employeerole.id
JOIN department ON employeerole.department_id = department.id
WHERE department.dept_name = ?

--View employees by department 
SELECT department.dept_name, CONCAT(employee.first_name, ' ', employee.last_name) as  employee
FROM employee
JOIN employeerole ON employee.role_id = employeerole.id
JOIN department ON employeerole.department_id = department.id
WHERE department.dept_name = ?;

--View employees by manager
SELECT CONCAT(b.first_name, ' ', b.last_name) as manager, CONCAT(a.first_name, ' ', a.last_name) as employee
FROM employee a
LEFT JOIN employeerole ON a.role_id = employeerole.id
LEFT JOIN department ON employeerole.department_id = department.id
LEFT JOIN employee b ON a.manager_id = b.id
WHERE a.manager_id = ?

--Delete department
DELETE from department where department.dept_name = ?

--Delete role
DELETE from employeerole where employeerole.title = ?

--Delete employee
DELETE from employee where employee.id = ?





