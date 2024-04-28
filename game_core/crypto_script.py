from cryptography.fernet import Fernet
import os
import sys

def generate_key():
    return Fernet.generate_key()

def load_key(key_file):
    with open(key_file, 'rb') as f:
        return f.read()

def save_key(key, key_file):
    with open(key_file, 'wb') as f:
        f.write(key)

def encrypt_file(key, file_path):
    try:
        with open(file_path, 'rb') as f:
            data = f.read()
        fernet = Fernet(key)
        encrypted_data = fernet.encrypt(data)
        with open(file_path + '.encrypted', 'wb') as f:
            f.write(encrypted_data)
        os.remove(file_path)
    except Exception as e:
        print(f"Error encrypting file: {e}")

def decrypt_file(key, encrypted_file_path):
    try:
        with open(encrypted_file_path, 'rb') as f:
            encrypted_data = f.read()
        fernet = Fernet(key)
        decrypted_data = fernet.decrypt(encrypted_data)
        with open(encrypted_file_path[:-10], 'wb') as f:
            f.write(decrypted_data)
        os.remove(encrypted_file_path)
    except Exception as e:
        print(f"Error decrypting file: {e}")

def encrypt_folder(key, folder_path):
    try:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                encrypt_file(key, os.path.join(root, file))
    except Exception as e:
        print(f"Error encrypting folder: {e}")

def decrypt_folder(key, folder_path):
    try:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if file.endswith('.encrypted'):
                    decrypt_file(key, os.path.join(root, file))
    except Exception as e:
        print(f"Error decrypting folder: {e}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python crypto_script.py <action> <folder_path> [<key_file>]")
        print("Actions: encrypt / decrypt")
        sys.exit(1)

    action = sys.argv[1]
    folder_path = sys.argv[2]

    if action not in ['encrypt', 'decrypt']:
        print("Invalid action. Use 'encrypt' or 'decrypt'.")
        sys.exit(1)

    if not os.path.isdir(folder_path):
        print("Folder not found.")
        sys.exit(1)

    key_file = 'key.key'

    if len(sys.argv) > 3:
        key_file = sys.argv[3]

    if not os.path.isfile(key_file):
        if action == 'encrypt':
            key = generate_key()
            save_key(key, key_file)
        else:
            print("Key file not found.")
            sys.exit(1)
    else:
        key = load_key(key_file)

    if action == 'encrypt':
        encrypt_folder(key, folder_path)
    else:
        decrypt_folder(key, folder_path)

if __name__ == "__main__":
    main()
