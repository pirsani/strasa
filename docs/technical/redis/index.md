# install redis

Installing Redis on Ubuntu is straightforward. Follow these steps to install and set up Redis:

---

### 1. **Update Package Index**

Run the following command to ensure your system is up-to-date:

```bash
sudo apt update
```

---

### 2. **Install Redis**

Install Redis using the default Ubuntu package repository:

```bash
### 2. **Install Redis**
Install Redis using the default Ubuntu package repository:
sudo apt install redis -y
```

---

### 3. **Verify Installation**

Check if Redis is installed and the correct version:

```bash
redis-server --version
```

---

### 4. **Start and Enable Redis**

Start the Redis service and enable it to start on boot:

```bash
sudo systemctl start redis
sudo systemctl enable redis-server
```

Check the service status:

```bash
sudo systemctl status redis
```

---

### 5. **Test Redis**

Test if Redis is working by connecting to the Redis CLI:

```bash
redis-cli
```

In the Redis prompt, type:

```bash
ping
```

If Redis is working, it will respond with:

```
PONG
```

Exit the Redis CLI:

```bash
exit
```

---

### 6. **(Optional) Configure Redis**

To adjust the Redis configuration file:

1. Open the configuration file:
   ```bash
   sudo nano /etc/redis/redis.conf
   ```
2. Common adjustments:

   - Change `bind 127.0.0.1` to `bind 0.0.0.0` to allow remote connections.
   - Adjust `maxmemory` to set the maximum memory Redis can use.
   - Enable `requirepass` to set a password for Redis.

3. Save and restart Redis:
   ```bash
   sudo systemctl restart redis
   ```

---

### 7. **Ensure Redis Starts on Boot**

Verify Redis is set to start on system boot:

```bash
sudo systemctl is-enabled redis
```

The output should be:

```
enabled
```

---

You now have Redis installed and configured on Ubuntu! If you need to install a specific version or build Redis from source, let me know.

# reset redis

```sh
redis-cli
KEYS \*
FLUSHDB
FLUSHALL
```
