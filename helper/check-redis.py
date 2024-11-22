import redis

client = redis.Redis(host='127.0.0.1', port=6379)

try:
    response = client.ping()
    print("PONG" if response else "No response")
except redis.ConnectionError:
    print("Failed to connect to Redis")