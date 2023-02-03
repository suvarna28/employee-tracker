SELECT employee.id, employee.first_name, employee.last_name, 
employeerole.title, department.dept_name, employeerole.salary, 
CONCAT(employee.first_name, ' ', employee.last_name) as manager

FROM employee

JOIN employeerole ON employee.role_id = employeerole.id

JOIN department ON employeerole.department_id = department.id;