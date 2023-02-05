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