sudo certbot --nginx -d d01.pirsani.id

Certificate is saved at: /etc/letsencrypt/live/d01.pirsani.id/fullchain.pem
Key is saved at: /etc/letsencrypt/live/d01.pirsani.id/privkey.pem

certbot install --cert-name d01.pirsani.id

sudo ln -s /etc/nginx/sites-available/d01.pirsani.id /etc/nginx/sites-enabled/

pm2 start pnpm --name d01 -- start -p 3030

sudo systemctl restart nginx

```
proxy_cache_path /var/cache/nginx/d01_pirsani levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;

upstream db01.pirsani_upstream {
    server 127.0.0.1:3030;
}

server {
        server_name d01.pirsani.id; # !!! - change to your domain name
        gzip on;
        gzip_proxied any;
        gzip_types application/javascript application/x-javascript text/css text/javascript;
        gzip_comp_level 5;
        gzip_buffers 16 8k;
        gzip_min_length 256;

    location /_next/static/ {
                proxy_cache STATIC;
                proxy_pass http://db01.pirsani_upstream;
                expires 60m;
                access_log off;
        }

    location / {
                proxy_pass http://db01.pirsani_upstream; # !!! - change to your app port
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/d01.pirsani.id/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/d01.pirsani.id/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot




}
server {
    if ($host = d01.pirsani.id) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = d01.pirsani.id) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name d01.pirsani.id d01.pirsani.id;
    return 404; # managed by Certbot

}
```

create user

```sh

# Generate a secure password
secure_password=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 32)
echo $secure_password

# Connect to PostgreSQL as the postgres user
sudo -u postgres psql

# Create a new database
CREATE DATABASE new_database_name;

# FOR PRISMA NEED ELEVATED USER
# Create a new user with a password
CREATE USER new_username WITH PASSWORD 'your_password';

# Grant all privileges on a specific database to the new user
GRANT ALL PRIVILEGES ON DATABASE your_database TO new_username;

# FOR RUNTIME WE NEED LIMITED PRIVILEGES

-- Create the elevated user
CREATE USER prisma_admin WITH PASSWORD 'admin_password';

-- Create the limited user
CREATE USER prisma_user WITH PASSWORD 'user_password';

-- Grant all privileges on the database to the elevated user
GRANT ALL PRIVILEGES ON DATABASE your_database TO prisma_admin;

-- Grant limited privileges on the database to the limited user
GRANT CONNECT ON DATABASE your_database TO prisma_user;
GRANT USAGE ON SCHEMA public TO prisma_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO prisma_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO prisma_user;

CREATE ROLE new_power_user WITH LOGIN SUPERUSER PASSWORD 'your_password';


# Exit psql
\q
```

```sh
pm2 start pnpm --name d01 -- start -p 3030
```
