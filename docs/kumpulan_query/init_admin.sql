select * from 
user_roles ur; 

select 
* from 
role_permissions rp 
where 
role_id ='superadmin';

-- misalkan role_id = 'admin' memiliki permission_id = 'cm4ea2rd4006lw5l7m091w0bi'
-- copy permission_id dari role_id = 'superadmin' ke role_id = 'admin'
insert into role_permissions
select 'cm4ea2rd4006lw5l7m091w0bi' as role_id ,rp.permission_id 
from 
role_permissions rp 
where 
role_id ='superadmin'