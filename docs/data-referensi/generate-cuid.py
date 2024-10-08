import cuid

def generate_cuids(count):
    for _ in range(count):
        print(cuid.cuid())

if __name__ == "__main__":
    try:
        count = int(input("How many CUIDs do you want to generate? "))
        generate_cuids(count)
    except ValueError:
        print("Please enter a valid number.")