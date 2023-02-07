USE employeetracker_db;

SELECT employee.id, employee.first_name, employee.last_name, 
employeerole.title, department.dept_name, employeerole.salary, employee.manager_id
FROM employee
JOIN employeerole ON employee.role_id = employeerole.id
JOIN department ON employeerole.department_id = department.id;

SELECT CONCAT(a.first_name,' ', a.last_name) 
FROM employee a
LEFT JOIN employee b ON a.id = b.manager_id
WHERE b.manager_id IS NOT NULL

--View all roles
SELECT employeerole.id, employeerole.title, department.dept_name, employeerole.salary
FROM employeerole
JOIN department ON employeerole.department_id = department.id;

--Total utilized budget of a department—in other words, the combined salaries of all employees in that department.
SELECT department.dept_name, sum(employeerole.salary)
FROM employee
JOIN employeerole ON employee.role_id = employeerole.id
JOIN department ON employeerole.department_id = department.id
GROUP BY department.dept_name;

--View all employees
SELECT a.id, a.first_name, a.last_name, 
employeerole.title, department.dept_name, employeerole.salary, CONCAT(b.first_name, ' ', b.last_name) as manager
FROM employee a
LEFT JOIN employeerole ON a.role_id = employeerole.id
LEFT JOIN department ON employeerole.department_id = department.id
LEFT JOIN employee b ON a.manager_id = b.id;

