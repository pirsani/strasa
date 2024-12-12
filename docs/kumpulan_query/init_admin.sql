select * from users u 
--cm4jxm2zv006qcmxxsf88gren
select * from  roles r 
--cm4jxm2p3006lcmxxx9kvejm8


select * from 
user_roles ur; 

select 
* from 
role_permissions rp 
where 
role_id ='superadmin';

-- misalkan role_id = 'admin' memiliki role_id = 'cm4jxm2p3006lcmxxx9kvejm8'
-- copy permission_id dari role_id = 'superadmin' ke role_id = 'admin'
insert into role_permissions
select 'cm4jxm2p3006lcmxxx9kvejm8' as role_id ,rp.permission_id 
from 
role_permissions rp 
where 
role_id ='superadmin'