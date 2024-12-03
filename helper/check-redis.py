import redis

def check_redis_status(client):
    """Check the status of Redis server."""
    try:
        response = client.ping()
        print("Redis is running: PONG" if response else "No response")
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")


def show_databases(client):
    """Show all available Redis databases and their keys if they have any."""
    try:
        db_count = int(client.config_get("databases").get("databases", 16))  # Default is 16
        print(f"Redis has {db_count} databases:")
        for db_index in range(db_count):
            client.execute_command('SELECT', db_index)
            keys = client.keys()
            keys_count = len(keys)
            print(f"Database {db_index}: {keys_count} keys")
            if keys_count > 0:
                print(f"Keys in Database {db_index}: {keys}")
    except Exception as e:
        print(f"Failed to retrieve databases: {e}")


def show_values(client, db_index=0):
    """Show all keys and their values in the specified Redis database."""
    try:
        client.execute_command('SELECT', db_index)  # Select the database
        keys = client.keys()
        if not keys:
            print(f"Database {db_index} is empty.")
        else:
            print(f"Keys and values in database {db_index}:")
            for key in keys:
                value = client.get(key)
                print(f"Key: {key}, Value: {value}" if value else f"Key: {key} has no value.")
    except Exception as e:
        print(f"Failed to retrieve keys/values: {e}")


def reset_database(client, db_index=0):
    """Reset all data in the specified Redis database."""
    try:
        client.execute_command('SELECT', db_index)  # Select the database
        client.flushdb()  # Clear the current database
        print(f"Database {db_index} has been reset.")
    except Exception as e:
        print(f"Failed to reset database {db_index}: {e}")


def reset_value(client, key, db_index=0):
    """Reset a specific key in the specified Redis database."""
    try:
        client.execute_command('SELECT', db_index)  # Select the database
        result = client.delete(key)
        if result:
            print(f"Key '{key}' has been reset.")
        else:
            print(f"Key '{key}' not found in database {db_index}.")
    except Exception as e:
        print(f"Failed to reset key '{key}': {e}")

def reset_redis(client):
    # Connect to Redis
    
    # Flush all databases
    client.flushall()
    print("All databases have been reset.")

def main():
    """Main function to provide user options and handle input."""
    client = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True)

    options = {
        "0": ("reset redis", reset_redis),
        "1": ("Check Redis status", check_redis_status),
        "2": ("Show available databases", show_databases),
        "3": ("Show values in a database", show_values),
        "4": ("Reset a database", reset_database),
        "5": ("Reset a specific key", reset_value),
        "6": ("Exit", None),
    }

    while True:
        print("\nAvailable options:")
        for key, (description, _) in options.items():
            print(f"{key}. {description}")

        choice = input("Select an option: ")

        if choice == "6":
            print("Exiting...")
            break

        if choice in options:
            if choice == "3":
                db_index = int(input("Enter the database index: "))
                show_values(client, db_index)
            elif choice == "4":
                db_index = int(input("Enter the database index to reset: "))
                reset_database(client, db_index)
            elif choice == "5":
                db_index = int(input("Enter the database index: "))
                key = input("Enter the key to reset: ")
                reset_value(client, key, db_index)
            else:
                func = options[choice][1]
                if func:
                    func(client)
        else:
            print("Invalid option. Please try again.")


if __name__ == "__main__":
    main()